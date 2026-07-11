import express from "express";
import { adminDashboardController } from "../controllers/admin-dashboard.controller.ts";
import { protect } from "../middlewares/protect.middleware.ts";
import { checkRole } from "../middlewares/authorization.middleware.ts";

const adminDashboardRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin-Dashboard
 *   description: Admin dashboard endpoints
 */

/**
 * @swagger
 * /api/admin/dashboard/summary:
 *   get:
 *     summary: Get admin dashboard summary
 *     description: Admin retrieves aggregate counters for users, providers, bookings, finance, disputes, and services.
 *     tags: [Admin-Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Admin dashboard summary retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         customers:
 *                           type: integer
 *                         providers:
 *                           type: integer
 *                     providers:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         pendingVerification:
 *                           type: integer
 *                         verified:
 *                           type: integer
 *                         rejected:
 *                           type: integer
 *                         suspended:
 *                           type: integer
 *                     bookings:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: integer
 *                         confirmed:
 *                           type: integer
 *                         checkedIn:
 *                           type: integer
 *                         checkedOut:
 *                           type: integer
 *                         dispute:
 *                           type: integer
 *                         completed:
 *                           type: integer
 *                     finance:
 *                       type: object
 *                       properties:
 *                         totalProcessedCommission:
 *                           type: number
 *                         totalProviderEarning:
 *                           type: number
 *                         pendingCommissionBookingAmount:
 *                           type: number
 *                     disputes:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: integer
 *                         resolvedToday:
 *                           type: integer
 *                     services:
 *                       type: object
 *                       properties:
 *                         active:
 *                           type: integer
 *                         hiddenByAdmin:
 *                           type: integer
 *                     withdrawals:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: integer
 *                         approved:
 *                           type: integer
 *                         rejected:
 *                           type: integer
 *                         paid:
 *                           type: integer
 *                         paidToday:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 */
adminDashboardRouter.get(
  "/dashboard/summary",
  protect,
  checkRole("ADMIN"),
  adminDashboardController.getSummary,
);

export default adminDashboardRouter;
