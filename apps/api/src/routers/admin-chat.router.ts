import express from "express";
import { adminChatController } from "../controllers/admin-chat.controller.ts";
import { checkRole } from "../middlewares/authorization.middleware.ts";
import { protect } from "../middlewares/protect.middleware.ts";

const adminChatRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin-Chat
 *   description: Admin support chat endpoints
 */

/**
 * @swagger
 * /api/admin/chat/threads:
 *   get:
 *     summary: List booking chat threads for admin
 *     tags: [Admin-Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bookingId
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
 *         description: Admin chat threads retrieved successfully
 */
adminChatRouter.get(
  "/chat/threads",
  protect,
  checkRole("ADMIN"),
  adminChatController.getAll,
);

/**
 * @swagger
 * /api/admin/bookings/{bookingId}/chat/thread:
 *   get:
 *     summary: Get or create a booking chat thread for admin support
 *     tags: [Admin-Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin chat thread retrieved successfully
 *       404:
 *         description: Booking not found
 */
adminChatRouter.get(
  "/bookings/:bookingId/chat/thread",
  protect,
  checkRole("ADMIN"),
  adminChatController.getOrCreateBookingThread,
);

/**
 * @swagger
 * /api/admin/chat/threads/{threadId}/messages:
 *   get:
 *     summary: Get chat messages as admin
 *     tags: [Admin-Chat]
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
 *         description: Admin chat messages retrieved successfully
 */
adminChatRouter.get(
  "/chat/threads/:threadId/messages",
  protect,
  checkRole("ADMIN"),
  adminChatController.getMessages,
);

/**
 * @swagger
 * /api/admin/chat/threads/{threadId}/messages:
 *   post:
 *     summary: Send support message as admin
 *     tags: [Admin-Chat]
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
 *                 example: "PetLink support is checking this booking."
 *     responses:
 *       201:
 *         description: Admin chat message sent successfully
 */
adminChatRouter.post(
  "/chat/threads/:threadId/messages",
  protect,
  checkRole("ADMIN"),
  adminChatController.sendMessage,
);

/**
 * @swagger
 * /api/admin/chat/threads/{threadId}/read:
 *   patch:
 *     summary: Mark chat messages as read by admin
 *     tags: [Admin-Chat]
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
 *         description: Admin chat thread marked as read successfully
 */
adminChatRouter.patch(
  "/chat/threads/:threadId/read",
  protect,
  checkRole("ADMIN"),
  adminChatController.markRead,
);

export default adminChatRouter;
