import express from "express";
import { mobileChatController } from "../../controllers/mobile-controllers/chat.controller.ts";
import { protect } from "../../middlewares/protect.middleware.ts";

const mobileChatRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Mobile-Chat
 *   description: Realtime chat endpoints for booking conversations
 */

/**
 * @swagger
 * /api/mobile/bookings/{bookingId}/chat/thread:
 *   get:
 *     summary: Get or create booking chat thread
 *     description: Customer or provider retrieves the chat thread for a booking they own.
 *     tags: [Mobile-Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Chat thread retrieved successfully
 *       400:
 *         description: Cannot create chat for rejected booking
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User does not have access to this booking
 *       404:
 *         description: Booking not found
 */
mobileChatRouter.get(
  "/bookings/:bookingId/chat/thread",
  protect,
  mobileChatController.getOrCreateBookingThread,
);

/**
 * @swagger
 * /api/mobile/chat/threads:
 *   get:
 *     summary: Get my chat threads
 *     description: Customer or provider retrieves their own chat thread list.
 *     tags: [Mobile-Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Chat threads retrieved successfully
 */
mobileChatRouter.get(
  "/chat/threads",
  protect,
  mobileChatController.getMyThreads,
);

/**
 * @swagger
 * /api/mobile/chat/threads/{threadId}/messages:
 *   get:
 *     summary: Get chat messages
 *     description: Customer or provider retrieves messages for a thread they can access.
 *     tags: [Mobile-Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: threadId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Chat messages retrieved successfully
 */
mobileChatRouter.get(
  "/chat/threads/:threadId/messages",
  protect,
  mobileChatController.getMessages,
);

/**
 * @swagger
 * /api/mobile/chat/threads/{threadId}/messages:
 *   post:
 *     summary: Send chat message
 *     description: Customer or provider sends a TEXT message, persisted to DB and emitted through Socket.IO.
 *     tags: [Mobile-Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: threadId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 2000
 *                 example: "Hello, I have a question about the booking."
 *     responses:
 *       201:
 *         description: Chat message sent successfully
 *       400:
 *         description: Empty or too long message
 */
mobileChatRouter.post(
  "/chat/threads/:threadId/messages",
  protect,
  mobileChatController.sendMessage,
);

/**
 * @swagger
 * /api/mobile/chat/threads/{threadId}/read:
 *   patch:
 *     summary: Mark chat thread messages as read
 *     description: Marks messages from the other participant as read.
 *     tags: [Mobile-Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: threadId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat thread marked as read successfully
 */
mobileChatRouter.patch(
  "/chat/threads/:threadId/read",
  protect,
  mobileChatController.markRead,
);

export default mobileChatRouter;
