import express from "express";
import { adminReportController } from "../controllers/admin-report.controller.ts";
import { protect } from "../middlewares/protect.middleware.ts";
import { checkRole } from "../middlewares/authorization.middleware.ts";

const adminReportRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin-Reports
 *   description: Admin revenue and operational reports
 */

/**
 * @swagger
 * /api/admin/reports/revenue:
 *   get:
 *     summary: Get revenue summary
 *     tags: [Admin-Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Revenue summary retrieved successfully
 */
adminReportRouter.get(
  "/reports/revenue",
  protect,
  checkRole("ADMIN"),
  adminReportController.getRevenueSummary,
);

/**
 * @swagger
 * /api/admin/reports/revenue/daily:
 *   get:
 *     summary: Get daily revenue chart data
 *     tags: [Admin-Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Daily revenue retrieved successfully
 */
adminReportRouter.get(
  "/reports/revenue/daily",
  protect,
  checkRole("ADMIN"),
  adminReportController.getDailyRevenue,
);

/**
 * @swagger
 * /api/admin/reports/providers:
 *   get:
 *     summary: Get provider performance report
 *     tags: [Admin-Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Provider performance report retrieved successfully
 */
adminReportRouter.get(
  "/reports/providers",
  protect,
  checkRole("ADMIN"),
  adminReportController.getProviderPerformance,
);

/**
 * @swagger
 * /api/admin/reports/disputes:
 *   get:
 *     summary: Get dispute report
 *     tags: [Admin-Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Dispute report retrieved successfully
 */
adminReportRouter.get(
  "/reports/disputes",
  protect,
  checkRole("ADMIN"),
  adminReportController.getDisputeReport,
);

export default adminReportRouter;
