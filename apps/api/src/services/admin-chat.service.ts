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
import { socketService } from "./socket.service.ts";

const MAX_TEXT_LENGTH = 2000;

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

function normalizeText(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestException("content is required");
  }

  const content = value.trim();
  if (content.length > MAX_TEXT_LENGTH) {
    throw new BadRequestException(
      `content must be at most ${MAX_TEXT_LENGTH} characters`,
    );
  }

  return content;
}

async function getThreadWithParticipants(threadId: string) {
  const thread = await prisma.chat_threads.findUnique({
    where: { id: threadId },
    include: {
      booking: {
        select: {
          id: true,
          status: true,
          paymentMethod: true,
          paymentStatus: true,
          appointmentStart: true,
          appointmentEnd: true,
          service: {
            select: {
              id: true,
              name: true,
              price: true,
              duration: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createAt: "desc" },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
              userName: true,
              fullName: true,
              avatar: true,
              role: true,
            },
          },
        },
      },
    },
  });

  if (!thread) throw new NotFoundException("Chat thread not found");

  const [customer, provider] = await Promise.all([
    prisma.customers.findUnique({
      where: { id: thread.customerId },
      select: {
        id: true,
        userId: true,
        location: true,
        users: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            phone: true,
            email: true,
            avatar: true,
            status: true,
          },
        },
      },
    }),
    prisma.providers.findUnique({
      where: { id: thread.providerId },
      select: {
        id: true,
        userId: true,
        businessName: true,
        phone: true,
        email: true,
        avatarUrl: true,
        providerStatus: true,
      },
    }),
  ]);

  if (!customer || !provider) {
    throw new NotFoundException("Chat participant not found");
  }

  return {
    ...thread,
    customer,
    provider,
  };
}

export const adminChatService = {
  async getOrCreateBookingThread(req: Request) {
    const bookingId = getRouteParam(req, "bookingId");
    const booking = await prisma.bookings.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        customerId: true,
        providerId: true,
      },
    });

    if (!booking) throw new NotFoundException("Booking not found");

    const thread = await prisma.chat_threads.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        customerId: booking.customerId,
        providerId: booking.providerId,
      },
      update: {},
    });

    return getThreadWithParticipants(thread.id);
  },

  async getAll(req: Request) {
    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );

    const bookingId = req.query.bookingId;
    if (bookingId !== undefined) {
      if (typeof bookingId !== "string" || !ObjectId.isValid(bookingId)) {
        throw new BadRequestException("bookingId must be a valid ObjectId");
      }
      where.bookingId = bookingId;
    }

    const [totalItems, threads] = await Promise.all([
      prisma.chat_threads.count({ where }),
      prisma.chat_threads.findMany({
        where,
        skip: index,
        take: pageSize,
        orderBy: [{ lastMessageAt: "desc" }, { createAt: "desc" }],
      }),
    ]);

    const items = await Promise.all(
      threads.map((thread) => getThreadWithParticipants(thread.id)),
    );
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

  async getMessages(req: Request) {
    const threadId = getRouteParam(req, "threadId");
    const thread = await prisma.chat_threads.findUnique({
      where: { id: threadId },
      select: { id: true },
    });

    if (!thread) throw new NotFoundException("Chat thread not found");

    const { page, pageSize, index } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );

    const [totalItems, items] = await Promise.all([
      prisma.chat_messages.count({ where: { threadId } }),
      prisma.chat_messages.findMany({
        where: { threadId },
        skip: index,
        take: pageSize,
        orderBy: { createAt: "asc" },
        include: {
          sender: {
            select: {
              id: true,
              userName: true,
              fullName: true,
              avatar: true,
              role: true,
            },
          },
        },
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

  async sendMessage(req: Request) {
    const adminUserId = getRequesterId(req);
    const threadId = getRouteParam(req, "threadId");
    const content = normalizeText(req.body?.content);
    const thread = await getThreadWithParticipants(threadId);

    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.chat_messages.create({
        data: {
          threadId: thread.id,
          bookingId: thread.bookingId,
          senderId: adminUserId,
          senderRole: "ADMIN",
          messageType: "TEXT",
          content,
        },
        include: {
          sender: {
            select: {
              id: true,
              userName: true,
              fullName: true,
              avatar: true,
              role: true,
            },
          },
        },
      });

      await tx.chat_threads.update({
        where: { id: thread.id },
        data: {
          lastMessage: content,
          lastMessageAt: created.createAt,
        },
      });

      return created;
    });

    const payload = {
      threadId: thread.id,
      bookingId: thread.bookingId,
      message,
    };
    socketService.emitToChatThread(thread.id, "chat:message:new", payload);
    socketService.emitToUser(thread.customer.userId, "chat:message:new", payload);
    socketService.emitToUser(thread.provider.userId, "chat:message:new", payload);

    const notificationMessage =
      content.length > 80 ? `${content.slice(0, 77)}...` : content;
    await notificationService.safeCreateMany([
      {
        userId: thread.customer.userId,
        type: "CHAT_MESSAGE_NEW",
        title: "New support message",
        message: notificationMessage,
        data: {
          threadId: thread.id,
          bookingId: thread.bookingId,
          messageId: message.id,
        },
      },
      {
        userId: thread.provider.userId,
        type: "CHAT_MESSAGE_NEW",
        title: "New support message",
        message: notificationMessage,
        data: {
          threadId: thread.id,
          bookingId: thread.bookingId,
          messageId: message.id,
        },
      },
    ]);

    return message;
  },

  async markRead(req: Request) {
    const adminUserId = getRequesterId(req);
    const threadId = getRouteParam(req, "threadId");
    const thread = await prisma.chat_threads.findUnique({
      where: { id: threadId },
      select: { id: true },
    });

    if (!thread) throw new NotFoundException("Chat thread not found");

    const readAt = new Date();
    const result = await prisma.chat_messages.updateMany({
      where: {
        threadId,
        senderId: { not: adminUserId },
        readAt: null,
      },
      data: { readAt },
    });

    const payload = {
      threadId,
      readerId: adminUserId,
      readAt,
      count: result.count,
    };
    socketService.emitToChatThread(threadId, "chat:read", payload);

    return payload;
  },
};
