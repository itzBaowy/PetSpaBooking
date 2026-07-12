import express from "express";
import { adminNotificationController } from "../controllers/admin-notification.controller.ts";
import { protect } from "../middlewares/protect.middleware.ts";
import { checkRole } from "../middlewares/authorization.middleware.ts";

const adminNotificationRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin-Notifications
 *   description: Admin notification and announcement endpoints
 */

/**
 * @swagger
 * /api/admin/notifications:
 *   get:
 *     summary: List notifications
 *     description: Admin lists notifications with optional filters.
 *     tags: [Admin-Notifications]
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
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Admin notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 */
adminNotificationRouter.get(
  "/notifications",
  protect,
  checkRole("ADMIN"),
  adminNotificationController.getAll,
);

/**
 * @swagger
 * /api/admin/notifications/send:
 *   post:
 *     summary: Send notification to one user
 *     description: Admin sends one in-app notification to a specific user.
 *     tags: [Admin-Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - title
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *                 example: ADMIN_ANNOUNCEMENT
 *               title:
 *                 type: string
 *                 example: System maintenance
 *               message:
 *                 type: string
 *                 example: PetLink will be under maintenance tonight.
 *               data:
 *                 type: object
 *                 nullable: true
 *                 example:
 *                   screen: home
 *     responses:
 *       201:
 *         description: Notification sent successfully
 *       400:
 *         description: Invalid payload
 *       404:
 *         description: User not found
 */
adminNotificationRouter.post(
  "/notifications/send",
  protect,
  checkRole("ADMIN"),
  adminNotificationController.send,
);

/**
 * @swagger
 * /api/admin/notifications/broadcast:
 *   post:
 *     summary: Broadcast notification by role
 *     description: Admin broadcasts an in-app notification to all ACTIVE users in one role.
 *     tags: [Admin-Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *               - type
 *               - title
 *               - message
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [CUSTOMER, PROVIDER, ADMIN]
 *                 example: PROVIDER
 *               type:
 *                 type: string
 *                 example: ADMIN_ANNOUNCEMENT
 *               title:
 *                 type: string
 *                 example: Provider policy update
 *               message:
 *                 type: string
 *                 example: Please review the latest provider policy.
 *               data:
 *                 type: object
 *                 nullable: true
 *                 example:
 *                   screen: provider_policy
 *     responses:
 *       201:
 *         description: Notification broadcast successfully
 *       400:
 *         description: Invalid payload
 */
adminNotificationRouter.post(
  "/notifications/broadcast",
  protect,
  checkRole("ADMIN"),
  adminNotificationController.broadcast,
);

export default adminNotificationRouter;
