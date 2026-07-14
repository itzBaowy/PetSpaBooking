import express from "express";
import { adminCommissionController } from "../controllers/admin-commission.controller.ts";
import { checkRole } from "../middlewares/authorization.middleware.ts";
import { protect } from "../middlewares/protect.middleware.ts";

const adminCommissionRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin-Commissions
 *   description: Admin commission tracking endpoints
 */

/**
 * @swagger
 * /api/admin/finance/commissions/summary:
 *   get:
 *     summary: Get commission summary
 *     tags: [Admin-Commissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Commission summary retrieved successfully
 */
adminCommissionRouter.get(
  "/finance/commissions/summary",
  protect,
  checkRole("ADMIN"),
  adminCommissionController.getSummary,
);

/**
 * @swagger
 * /api/admin/finance/commissions/pending:
 *   get:
 *     summary: List pending commission records
 *     tags: [Admin-Commissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending commission records retrieved successfully
 */
adminCommissionRouter.get(
  "/finance/commissions/pending",
  protect,
  checkRole("ADMIN"),
  adminCommissionController.getPending,
);

/**
 * @swagger
 * /api/admin/finance/commissions:
 *   get:
 *     summary: List commission records
 *     tags: [Admin-Commissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CHARGED, RELEASED, FAILED]
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [CASH, ONLINE]
 *       - in: query
 *         name: providerId
 *         schema:
 *           type: string
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
 *         description: Commission records retrieved successfully
 */
adminCommissionRouter.get(
  "/finance/commissions",
  protect,
  checkRole("ADMIN"),
  adminCommissionController.getAll,
);

/**
 * @swagger
 * /api/admin/finance/commissions/{id}:
 *   get:
 *     summary: Get commission record detail
 *     tags: [Admin-Commissions]
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
 *         description: Commission record retrieved successfully
 *       404:
 *         description: Commission record not found
 */
adminCommissionRouter.get(
  "/finance/commissions/:id",
  protect,
  checkRole("ADMIN"),
  adminCommissionController.getById,
);

export default adminCommissionRouter;
