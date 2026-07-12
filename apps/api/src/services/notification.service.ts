import { Request } from "express";
import { ObjectId } from "mongodb";
import prisma from "../../connect.prisma.ts";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../common/helpers/exception.helper.ts";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.ts";
import { socketService } from "./socket.service.ts";

type CreateNotificationInput = {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
};

function getRequesterId(req: Request): string {
  const userId = (req as Request & { user?: { userId?: string } }).user
    ?.userId;
  if (!userId) throw new UnauthorizedException("Unauthorized");
  return userId;
}

function getRouteParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string" || !ObjectId.isValid(value)) {
    throw new BadRequestException(`Invalid route parameter: ${name}`);
  }

  return value;
}

function encodeData(data?: Record<string, unknown> | null) {
  return data ? JSON.stringify(data) : null;
}

function decodeNotification<T extends { data: string | null }>(notification: T) {
  return {
    ...notification,
    data: notification.data ? JSON.parse(notification.data) : null,
  };
}

function logNotificationError(action: string, error: unknown) {
  console.error(`[notification] ${action} failed:`, error);
}

function emitNotification<T extends { userId: string; data: string | null }>(
  notification: T,
) {
  socketService.emitToUser(notification.userId, "notification:new", {
    notification: decodeNotification(notification),
  });
}

export const notificationService = {
  async create(input: CreateNotificationInput) {
    const notification = await prisma.notifications.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        data: encodeData(input.data),
      },
    });

    emitNotification(notification);
    return notification;
  },

  async createMany(inputs: CreateNotificationInput[]) {
    if (inputs.length === 0) return { count: 0 };

    const result = await prisma.notifications.createMany({
      data: inputs.map((input) => ({
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        data: encodeData(input.data),
      })),
    });

    for (const input of inputs) {
      socketService.emitToUser(input.userId, "notification:new", {
        notification: {
          id: null,
          userId: input.userId,
          type: input.type,
          title: input.title,
          message: input.message,
          data: input.data ?? null,
          readAt: null,
          createAt: new Date().toISOString(),
        },
        shouldRefetch: true,
      });
    }

    return result;
  },

  async safeCreate(input: CreateNotificationInput) {
    try {
      return await this.create(input);
    } catch (error) {
      logNotificationError("create", error);
      return null;
    }
  },

  async safeCreateMany(inputs: CreateNotificationInput[]) {
    try {
      return await this.createMany(inputs);
    } catch (error) {
      logNotificationError("createMany", error);
      return { count: 0 };
    }
  },

  async getMine(req: Request) {
    const userId = getRequesterId(req);
    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );

    where.userId = userId;

    if (typeof req.query.type === "string" && req.query.type) {
      where.type = req.query.type;
    }

    if (req.query.unread === "true") {
      where.OR = [
        { readAt: null },
        { readAt: { isSet: false } },
      ];
    }

    const [totalItems, unreadCount, items] = await Promise.all([
      prisma.notifications.count({ where }),
      prisma.notifications.count({
        where: {
          userId,
          OR: [
            { readAt: null },
            { readAt: { isSet: false } },
          ],
        },
      }),
      prisma.notifications.findMany({
        where,
        skip: index,
        take: pageSize,
        orderBy: { createAt: "desc" },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      items: items.map(decodeNotification),
      unreadCount,
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

  async markRead(req: Request) {
    const userId = getRequesterId(req);
    const id = getRouteParam(req, "id");

    const updated = await prisma.notifications.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });

    if (updated.count === 0) {
      throw new NotFoundException("Notification not found");
    }

    const notification = await prisma.notifications.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    return decodeNotification(notification);
  },

  async markAllRead(req: Request) {
    const userId = getRequesterId(req);
    const updated = await prisma.notifications.updateMany({
      where: {
        userId,
        OR: [
          { readAt: null },
          { readAt: { isSet: false } },
        ],
      },
      data: { readAt: new Date() },
    });

    return { count: updated.count };
  },
};
