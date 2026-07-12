import { Request } from "express";
import { ObjectId } from "mongodb";
import prisma from "../../connect.prisma.ts";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.ts";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../common/helpers/exception.helper.ts";
import { notificationService } from "./notification.service.ts";
import { adminAuditLogService } from "./admin-audit-log.service.ts";

const USER_ROLES = ["CUSTOMER", "PROVIDER", "ADMIN"] as const;

function getRequesterId(req: Request): string {
  const userId = (req as Request & { user?: { userId?: string } }).user
    ?.userId;
  if (!userId) throw new UnauthorizedException("Unauthorized");
  return userId;
}

function getRequiredString(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestException(`${name} is required`);
  }

  return value.trim();
}

function getOptionalData(value: unknown): Record<string, unknown> | null {
  if (value === undefined || value === null) return null;
  if (
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new BadRequestException("data must be an object");
  }

  return value as Record<string, unknown>;
}

function getObjectIdQuery(value: unknown, name: string) {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !ObjectId.isValid(value)) {
    throw new BadRequestException(`${name} must be a valid ObjectId`);
  }

  return value;
}

function getDateQuery(value: unknown, name: string) {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new BadRequestException(`${name} must be a valid date`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`${name} must be a valid date`);
  }

  return date;
}

function decodeData<T extends { data: string | null }>(notification: T) {
  return {
    ...notification,
    data: notification.data ? JSON.parse(notification.data) : null,
  };
}

export const adminNotificationService = {
  async getAll(req: Request) {
    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );
    const userId = getObjectIdQuery(req.query.userId, "userId");
    const from = getDateQuery(req.query.from, "from");
    const to = getDateQuery(req.query.to, "to");

    if (userId) where.userId = userId;
    if (typeof req.query.type === "string" && req.query.type) {
      where.type = req.query.type;
    }
    if (from || to) {
      where.createAt = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }

    const [totalItems, items] = await Promise.all([
      prisma.notifications.count({ where }),
      prisma.notifications.findMany({
        where,
        skip: index,
        take: pageSize,
        orderBy: { createAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              userName: true,
              fullName: true,
              email: true,
              phone: true,
              role: true,
              status: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      items: items.map(decodeData),
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

  async send(req: Request) {
    const adminId = getRequesterId(req);
    const userId = getRequiredString(req.body?.userId, "userId");
    const type = getRequiredString(req.body?.type, "type");
    const title = getRequiredString(req.body?.title, "title");
    const message = getRequiredString(req.body?.message, "message");
    const data = getOptionalData(req.body?.data);

    if (!ObjectId.isValid(userId)) {
      throw new BadRequestException("userId must be a valid ObjectId");
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const notification = await notificationService.create({
      userId,
      type,
      title,
      message,
      data,
    });

    await adminAuditLogService.safeLog({
      adminId,
      action: "ADMIN_NOTIFICATION_SEND",
      targetType: "USER",
      targetId: userId,
      metadata: {
        notificationId: notification.id,
        type,
        userRole: user.role,
        userStatus: user.status,
      },
    });

    return decodeData(notification);
  },

  async broadcast(req: Request) {
    const adminId = getRequesterId(req);
    const role = getRequiredString(req.body?.role, "role");
    const type = getRequiredString(req.body?.type, "type");
    const title = getRequiredString(req.body?.title, "title");
    const message = getRequiredString(req.body?.message, "message");
    const data = getOptionalData(req.body?.data);

    if (!USER_ROLES.includes(role as (typeof USER_ROLES)[number])) {
      throw new BadRequestException(`role must be one of: ${USER_ROLES.join(", ")}`);
    }

    const users = await prisma.users.findMany({
      where: {
        role,
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    });

    const result = await notificationService.createMany(
      users.map((user) => ({
        userId: user.id,
        type,
        title,
        message,
        data,
      })),
    );

    await adminAuditLogService.safeLog({
      adminId,
      action: "ADMIN_NOTIFICATION_BROADCAST",
      targetType: "ROLE",
      targetId: role,
      metadata: {
        role,
        type,
        count: result.count,
      },
    });

    return {
      role,
      type,
      count: result.count,
    };
  },
};
