import { Request } from "express";
import { ObjectId } from "mongodb";
import prisma from "../../connect.prisma.ts";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../common/helpers/exception.helper.ts";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.ts";
import { notificationService } from "./notification.service.ts";
import { adminAuditLogService } from "./admin-audit-log.service.ts";

const USER_STATUSES = ["ACTIVE", "INACTIVE", "BANNED"] as const;
const USER_ROLES = ["CUSTOMER", "PROVIDER", "ADMIN"] as const;

type UserStatus = (typeof USER_STATUSES)[number];
type UserRole = (typeof USER_ROLES)[number];

const ADMIN_USER_SELECT = {
  id: true,
  userName: true,
  email: true,
  phone: true,
  fullName: true,
  avatar: true,
  role: true,
  status: true,
  createAt: true,
  updateAt: true,
} as const;

function getRequesterId(req: Request): string {
  const userId = (req as Request & { user?: { userId?: string } }).user
    ?.userId;
  if (!userId) {
    throw new UnauthorizedException("Unauthorized");
  }

  return userId;
}

function getRouteParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string" || !ObjectId.isValid(value)) {
    throw new BadRequestException(`Invalid route parameter: ${name}`);
  }

  return value;
}

function getStatus(value: unknown): UserStatus | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !USER_STATUSES.includes(value as UserStatus)) {
    throw new BadRequestException(
      `status must be one of: ${USER_STATUSES.join(", ")}`,
    );
  }

  return value as UserStatus;
}

function getRole(value: unknown): UserRole | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !USER_ROLES.includes(value as UserRole)) {
    throw new BadRequestException(`role must be one of: ${USER_ROLES.join(", ")}`);
  }

  return value as UserRole;
}

function getRequiredStatus(value: unknown): UserStatus {
  const status = getStatus(value);
  if (!status) {
    throw new BadRequestException("status is required");
  }

  return status;
}

function getOptionalReason(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestException("reason must be a non-empty string");
  }

  return value.trim();
}

function applyKeyword(where: Record<string, unknown>, keyword: unknown) {
  if (typeof keyword !== "string" || !keyword.trim()) return;

  const contains = keyword.trim();
  where.OR = [
    { userName: { contains, mode: "insensitive" } },
    { email: { contains, mode: "insensitive" } },
    { phone: { contains, mode: "insensitive" } },
    { fullName: { contains, mode: "insensitive" } },
  ];
}

export const adminUserService = {
  async getAll(req: Request) {
    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );
    const role = getRole(req.query.role);
    const status = getStatus(req.query.status);

    if (role) where.role = role;
    if (status) where.status = status;
    applyKeyword(where, req.query.keyword);

    const [totalItems, items] = await Promise.all([
      prisma.users.count({ where }),
      prisma.users.findMany({
        where,
        select: ADMIN_USER_SELECT,
        skip: index,
        take: pageSize,
        orderBy: { createAt: "desc" },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      items,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  async getById(req: Request) {
    const id = getRouteParam(req, "id");

    const user = await prisma.users.findUnique({
      where: { id },
      select: {
        ...ADMIN_USER_SELECT,
        customers: {
          select: {
            id: true,
            location: true,
          },
        },
        notifications: {
          orderBy: { createAt: "desc" },
          take: 5,
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const provider = await prisma.providers.findUnique({
      where: { userId: id },
      select: {
        id: true,
        businessName: true,
        providerStatus: true,
        depositStatus: true,
        depositBalance: true,
        walletBalance: true,
        adminNote: true,
      },
    });

    const customerId = user.customers?.id;
    const providerId = provider?.id;

    const [
      customerBookings,
      providerBookings,
      customerDisputes,
      providerDisputes,
      unreadNotifications,
      totalNotifications,
    ] = await Promise.all([
      customerId ? prisma.bookings.count({ where: { customerId } }) : 0,
      providerId ? prisma.bookings.count({ where: { providerId } }) : 0,
      customerId ? prisma.booking_disputes.count({ where: { customerId } }) : 0,
      providerId ? prisma.booking_disputes.count({ where: { providerId } }) : 0,
      prisma.notifications.count({
        where: {
          userId: id,
          OR: [{ readAt: null }, { readAt: { isSet: false } }],
        },
      }),
      prisma.notifications.count({ where: { userId: id } }),
    ]);

    return {
      ...user,
      provider,
      stats: {
        bookingsAsCustomer: customerBookings,
        bookingsAsProvider: providerBookings,
        disputesAsCustomer: customerDisputes,
        disputesAsProvider: providerDisputes,
        unreadNotifications,
        totalNotifications,
      },
    };
  },

  async updateStatus(req: Request) {
    const requesterId = getRequesterId(req);
    const id = getRouteParam(req, "id");
    const status = getRequiredStatus(req.body?.status);
    const reason = getOptionalReason(req.body?.reason);

    if (requesterId === id && status !== "ACTIVE") {
      throw new BadRequestException("Admin cannot deactivate or ban themselves");
    }

    const user = await prisma.users.findUnique({
      where: { id },
      select: ADMIN_USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    let providerStatusChange:
      | {
          providerId: string;
          previousStatus: string;
          nextStatus: string;
          restoredFromUserSuspension: boolean;
        }
      | null = null;

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.users.update({
        where: { id },
        data: { status },
        select: ADMIN_USER_SELECT,
      });

      const provider = await tx.providers.findUnique({
        where: { userId: id },
        select: {
          id: true,
          providerStatus: true,
          statusBeforeUserSuspension: true,
        },
      });

      if (status !== "ACTIVE") {
        if (provider) {
          const statusBeforeUserSuspension =
            provider.statusBeforeUserSuspension ??
            (provider.providerStatus === "SUSPENDED"
              ? null
              : provider.providerStatus);

          await tx.providers.update({
            where: { id: provider.id },
            data: {
              providerStatus: "SUSPENDED",
              statusBeforeUserSuspension,
              adminNote: reason ?? `User status changed to ${status}`,
            },
          });

          providerStatusChange = {
            providerId: provider.id,
            previousStatus: provider.providerStatus,
            nextStatus: "SUSPENDED",
            restoredFromUserSuspension: false,
          };
        }
      } else if (provider?.statusBeforeUserSuspension) {
        await tx.providers.update({
          where: { id: provider.id },
          data: {
            providerStatus: provider.statusBeforeUserSuspension,
            statusBeforeUserSuspension: null,
            adminNote: null,
          },
        });

        providerStatusChange = {
          providerId: provider.id,
          previousStatus: provider.providerStatus,
          nextStatus: provider.statusBeforeUserSuspension,
          restoredFromUserSuspension: true,
        };
      }

      return updated;
    });

    await notificationService.safeCreate({
      userId: id,
      type: "ACCOUNT_STATUS_CHANGED",
      title: "Account status changed",
      message: `Your account status was changed to ${status}.`,
      data: { status, reason },
    });

    await adminAuditLogService.safeLog({
      adminId: requesterId,
      action: "USER_STATUS_UPDATE",
      targetType: "USER",
      targetId: id,
      metadata: {
        previousStatus: user.status,
        status,
        reason,
        providerStatusChange,
      },
    });

    return updatedUser;
  },
};
