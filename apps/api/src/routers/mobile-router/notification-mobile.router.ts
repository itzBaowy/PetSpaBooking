import express from "express";
import { mobileNotificationController } from "../../controllers/mobile-controllers/notification.controller.ts";
import { protect } from "../../middlewares/protect.middleware.ts";

const mobileNotificationRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Mobile-Notifications
 *   description: Mobile in-app notification endpoints
 */

/**
 * @swagger
 * /api/mobile/notifications:
 *   get:
 *     summary: Get my notifications
 *     tags: [Mobile-Notifications]
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: unread
 *         schema:
 *           type: boolean
 *         description: Set true to return unread notifications only.
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
mobileNotificationRouter.get(
  "/notifications",
  protect,
  mobileNotificationController.getMine,
);

/**
 * @swagger
 * /api/mobile/notifications/{id}/read:
 *   patch:
 *     summary: Mark one notification as read
 *     tags: [Mobile-Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *       404:
 *         description: Notification not found
 */
mobileNotificationRouter.patch(
  "/notifications/:id/read",
  protect,
  mobileNotificationController.markRead,
);

/**
 * @swagger
 * /api/mobile/notifications/read-all:
 *   patch:
 *     summary: Mark all my notifications as read
 *     tags: [Mobile-Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications marked as read successfully
 */
mobileNotificationRouter.patch(
  "/notifications/read-all",
  protect,
  mobileNotificationController.markAllRead,
);

export default mobileNotificationRouter;
