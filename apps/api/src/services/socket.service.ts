import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import prisma from "../../connect.prisma.ts";
import { tokenService } from "./token.service.ts";

type SocketPayload = Record<string, unknown>;

let io: Server | null = null;

function getAllowedOrigins() {
  return [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://petlink.io.vn",
    "https://www.petlink.io.vn",
  ];
}

function getTokenFromHandshake(authToken?: unknown, header?: string) {
  if (typeof authToken === "string" && authToken) return authToken;
  if (!header) return null;

  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

export const socketService = {
  init(server: HttpServer) {
    io = new Server(server, {
      cors: {
        origin: getAllowedOrigins(),
        credentials: true,
      },
    });

    io.use(async (socket, next) => {
      try {
        const token = getTokenFromHandshake(
          socket.handshake.auth?.token,
          socket.handshake.headers.authorization,
        );

        if (!token) {
          next(new Error("Unauthorized"));
          return;
        }

        const decoded = tokenService.verifyAccessToken(token);
        const userId = decoded.userId;
        if (typeof userId !== "string") {
          next(new Error("Invalid token payload"));
          return;
        }

        const user = await prisma.users.findUnique({
          where: { id: userId },
          select: {
            id: true,
            role: true,
            status: true,
          },
        });

        if (!user || user.status !== "ACTIVE") {
          next(new Error("Account is not active"));
          return;
        }

        socket.data.userId = user.id;
        socket.data.role = user.role;
        if (user.role === "PROVIDER") {
          const provider = await prisma.providers.findUnique({
            where: { userId: user.id },
            select: { id: true },
          });
          socket.data.providerId = provider?.id ?? null;
        } else {
          socket.data.providerId = null;
        }
        next();
      } catch {
        next(new Error("Unauthorized"));
      }
    });

    io.on("connection", (socket) => {
      const userId = socket.data.userId as string;
      const role = socket.data.role as string;
      const providerId = socket.data.providerId as string | null;

      socket.join(`user:${userId}`);
      socket.join(`role:${role}`);

      if (providerId) {
        socket.join(`provider:${providerId}`);
      }

      socket.on("booking:join", async (payload: { bookingId?: unknown }) => {
        if (typeof payload?.bookingId !== "string") return;

        const booking = await prisma.bookings.findUnique({
          where: { id: payload.bookingId },
          select: {
            id: true,
            customer: {
              select: {
                userId: true,
              },
            },
            providerId: true,
          },
        });

        if (
          booking &&
          (booking.customer.userId === userId ||
            (providerId && booking.providerId === providerId) ||
            role === "ADMIN")
        ) {
          socket.join(`booking:${booking.id}`);
        }
      });

      socket.on("booking:leave", (payload: { bookingId?: unknown }) => {
        if (typeof payload?.bookingId === "string") {
          socket.leave(`booking:${payload.bookingId}`);
        }
      });

      socket.on("chat:join", async (payload: { threadId?: unknown }) => {
        if (typeof payload?.threadId !== "string") return;

        const thread = await prisma.chat_threads.findUnique({
          where: { id: payload.threadId },
          select: {
            id: true,
            booking: {
              select: {
                customer: {
                  select: {
                    userId: true,
                  },
                },
                providerId: true,
              },
            },
          },
        });

        if (
          thread &&
          (thread.booking.customer.userId === userId ||
            (providerId && thread.booking.providerId === providerId) ||
            role === "ADMIN")
        ) {
          socket.join(`chat:thread:${thread.id}`);
        }
      });

      socket.on("chat:leave", (payload: { threadId?: unknown }) => {
        if (typeof payload?.threadId === "string") {
          socket.leave(`chat:thread:${payload.threadId}`);
        }
      });

      socket.on(
        "chat:typing",
        (payload: { threadId?: unknown; isTyping?: unknown }) => {
          if (typeof payload?.threadId !== "string") return;
          socket.to(`chat:thread:${payload.threadId}`).emit("chat:typing", {
            threadId: payload.threadId,
            userId,
            isTyping: payload.isTyping === true,
          });
        },
      );

      socket.emit("socket:connected", {
        userId,
        role,
        providerId,
      });
    });

    console.log("[socket] Socket.IO initialized");
    return io;
  },

  getServer() {
    return io;
  },

  emitToUser(userId: string, event: string, payload: SocketPayload) {
    io?.to(`user:${userId}`).emit(event, payload);
  },

  emitToProvider(providerId: string, event: string, payload: SocketPayload) {
    io?.to(`provider:${providerId}`).emit(event, payload);
  },

  emitToRole(role: string, event: string, payload: SocketPayload) {
    io?.to(`role:${role}`).emit(event, payload);
  },

  emitToAdmins(event: string, payload: SocketPayload) {
    this.emitToRole("ADMIN", event, payload);
  },

  emitToBooking(bookingId: string, event: string, payload: SocketPayload) {
    io?.to(`booking:${bookingId}`).emit(event, payload);
  },

  emitToChatThread(threadId: string, event: string, payload: SocketPayload) {
    io?.to(`chat:thread:${threadId}`).emit(event, payload);
  },
};
