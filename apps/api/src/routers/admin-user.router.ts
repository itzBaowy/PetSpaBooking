import express from "express";
import { adminUserController } from "../controllers/admin-user.controller.ts";
import { protect } from "../middlewares/protect.middleware.ts";
import { checkRole } from "../middlewares/authorization.middleware.ts";

const adminUserRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin-Users
 *   description: Admin user account management endpoints
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List users for admin
 *     tags: [Admin-Users]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [CUSTOMER, PROVIDER, ADMIN]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, BANNED]
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search userName, email, phone, or fullName.
 *     responses:
 *       200:
 *         description: Admin users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 */
adminUserRouter.get(
  "/users",
  protect,
  checkRole("ADMIN"),
  adminUserController.getAll,
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user detail for admin
 *     tags: [Admin-Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Admin user retrieved successfully
 *       404:
 *         description: User not found
 */
adminUserRouter.get(
  "/users/:id",
  protect,
  checkRole("ADMIN"),
  adminUserController.getById,
);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   patch:
 *     summary: Update user account status
 *     description: Admin changes a user to ACTIVE, INACTIVE, or BANNED. If the user has a provider profile and is deactivated/banned, the provider profile is suspended.
 *     tags: [Admin-Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, BANNED]
 *                 example: BANNED
 *               reason:
 *                 type: string
 *                 nullable: true
 *                 example: "Fraudulent activity"
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Invalid status or admin tried to ban/deactivate themselves
 *       404:
 *         description: User not found
 */
adminUserRouter.patch(
  "/users/:id/status",
  protect,
  checkRole("ADMIN"),
  adminUserController.updateStatus,
);

export default adminUserRouter;
