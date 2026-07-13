import express from "express";
import { adminDisputeController } from "../controllers/admin-dispute.controller.ts";
import { protect } from "../middlewares/protect.middleware.ts";
import { checkRole } from "../middlewares/authorization.middleware.ts";

const adminDisputeRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin-Disputes
 *   description: Admin dispute management endpoints
 */

/**
 * @swagger
 * /api/admin/disputes:
 *   get:
 *     summary: List booking disputes
 *     description: Admin retrieves booking disputes, optionally filtered by status.
 *     tags: [Admin-Disputes]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, RESOLVED_PROVIDER_WIN, RESOLVED_CUSTOMER_WIN, CANCELLED]
 *     responses:
 *       200:
 *         description: Disputes retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 */
adminDisputeRouter.get(
  "/disputes",
  protect,
  checkRole("ADMIN"),
  adminDisputeController.getAll,
);

/**
 * @swagger
 * /api/admin/disputes/{id}:
 *   get:
 *     summary: Get dispute detail
 *     description: Admin retrieves a booking dispute by ID.
 *     tags: [Admin-Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dispute ID
 *     responses:
 *       200:
 *         description: Dispute retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Dispute not found
 */
adminDisputeRouter.get(
  "/disputes/:id",
  protect,
  checkRole("ADMIN"),
  adminDisputeController.getById,
);

/**
 * @swagger
 * /api/admin/disputes/{id}/resolve:
 *   patch:
 *     summary: Resolve a pending dispute
 *     description: Admin resolves a PENDING dispute. Provider win or cancelled dispute completes the booking and triggers commission processing. Customer win cancels the booking without commission processing; if the booking was paid online, it moves to REFUND_PENDING for manual refund processing.
 *     tags: [Admin-Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dispute ID
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
 *                 enum: [RESOLVED_PROVIDER_WIN, RESOLVED_CUSTOMER_WIN, CANCELLED]
 *                 example: RESOLVED_PROVIDER_WIN
 *               adminNote:
 *                 type: string
 *                 nullable: true
 *                 example: "Provider completed the service correctly."
 *     responses:
 *       200:
 *         description: Dispute resolved successfully
 *       400:
 *         description: Dispute is not pending, booking is not in dispute, or invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Dispute not found
 */
adminDisputeRouter.patch(
  "/disputes/:id/resolve",
  protect,
  checkRole("ADMIN"),
  adminDisputeController.resolve,
);

export default adminDisputeRouter;
