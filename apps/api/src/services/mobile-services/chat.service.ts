import { Request } from "express";
import { ObjectId } from "mongodb";
import prisma from "../../../connect.prisma.ts";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "../../common/helpers/exception.helper.ts";
import { buildQueryPrisma } from "../../common/helpers/build-query-prisma.helper.ts";
import { notificationService } from "../notification.service.ts";
import { socketService } from "../socket.service.ts";

const MAX_TEXT_LENGTH = 2000;

type ChatUserContext = {
  userId: string;
  role: string;
  customerId: string | null;
  providerId: string | null;
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

function normalizeText(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestException("content is required");
  }

  const content = value.trim();
  if (content.length > MAX_TEXT_LENGTH) {
    throw new BadRequestException(`content must be at most ${MAX_TEXT_LENGTH} characters`);
  }

  return content;
}

async function getUserContext(userId: string): Promise<ChatUserContext> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user) throw new UnauthorizedException("Unauthorized");

  const [customer, provider] = await Promise.all([
    prisma.customers.findUnique({
      where: { userId },
      select: { id: true },
    }),
    prisma.providers.findUnique({
      where: { userId },
      select: { id: true },
    }),
  ]);

  return {
    userId,
    role: user.role,
    customerId: customer?.id ?? null,
    providerId: provider?.id ?? null,
  };
}

function assertThreadAccess(
  thread: { customerId: string; providerId: string },
  context: ChatUserContext,
) {
  if (
    thread.customerId !== context.customerId &&
    thread.providerId !== context.providerId
  ) {
    throw new ForbiddenException("You do not have access to this chat thread");
  }
}

function getSenderRole(context: ChatUserContext) {
  if (context.customerId) return "CUSTOMER";
  if (context.providerId) return "PROVIDER";
  return context.role;
}

function getReceiverUserId(
  thread: {
    customer: { userId: string };
    provider: { userId: string };
  },
  context: ChatUserContext,
) {
  return context.customerId ? thread.provider.userId : thread.customer.userId;
}

async function getThreadWithParticipants(threadId: string) {
  const thread = await prisma.chat_threads.findUnique({
    where: { id: threadId },
    include: {
      booking: {
        select: {
          id: true,
          status: true,
          appointmentStart: true,
          service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createAt: "desc" },
        take: 1,
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
        users: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            avatar: true,
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
        avatarUrl: true,
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

export const mobileChatService = {
  async getOrCreateBookingThread(req: Request) {
    const userId = getRequesterId(req);
    const bookingId = getRouteParam(req, "bookingId");
    const context = await getUserContext(userId);

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
    assertThreadAccess(booking, context);

    if (booking.status === "REJECTED") {
      throw new BadRequestException("Cannot create chat for REJECTED booking");
    }

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

  async getMyThreads(req: Request) {
    const userId = getRequesterId(req);
    const context = await getUserContext(userId);
    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );

    if (context.customerId) {
      where.customerId = context.customerId;
    } else if (context.providerId) {
      where.providerId = context.providerId;
    } else {
      throw new ForbiddenException("Chat is only available for customers and providers");
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
    const userId = getRequesterId(req);
    const threadId = getRouteParam(req, "threadId");
    const context = await getUserContext(userId);
    const thread = await prisma.chat_threads.findUnique({
      where: { id: threadId },
      select: {
        id: true,
        customerId: true,
        providerId: true,
      },
    });

    if (!thread) throw new NotFoundException("Chat thread not found");
    assertThreadAccess(thread, context);

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
    const userId = getRequesterId(req);
    const threadId = getRouteParam(req, "threadId");
    const context = await getUserContext(userId);
    const content = normalizeText(req.body?.content);
    const thread = await getThreadWithParticipants(threadId);

    assertThreadAccess(thread, context);

    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.chat_messages.create({
        data: {
          threadId: thread.id,
          bookingId: thread.bookingId,
          senderId: context.userId,
          senderRole: getSenderRole(context),
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
    socketService.emitToUser(getReceiverUserId(thread, context), "chat:message:new", payload);

    await notificationService.safeCreate({
      userId: getReceiverUserId(thread, context),
      type: "CHAT_MESSAGE_NEW",
      title: "New chat message",
      message: content.length > 80 ? `${content.slice(0, 77)}...` : content,
      data: {
        threadId: thread.id,
        bookingId: thread.bookingId,
        messageId: message.id,
      },
    });

    return message;
  },

  async markRead(req: Request) {
    const userId = getRequesterId(req);
    const threadId = getRouteParam(req, "threadId");
    const context = await getUserContext(userId);
    const thread = await prisma.chat_threads.findUnique({
      where: { id: threadId },
      select: {
        id: true,
        customerId: true,
        providerId: true,
      },
    });

    if (!thread) throw new NotFoundException("Chat thread not found");
    assertThreadAccess(thread, context);

    const readAt = new Date();
    const result = await prisma.chat_messages.updateMany({
      where: {
        threadId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt },
    });

    const payload = {
      threadId,
      readerId: userId,
      readAt,
      count: result.count,
    };
    socketService.emitToChatThread(threadId, "chat:read", payload);

    return payload;
  },
};
