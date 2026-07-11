import express from "express";
import { adminAuditLogController } from "../controllers/admin-audit-log.controller.ts";
import { protect } from "../middlewares/protect.middleware.ts";
import { checkRole } from "../middlewares/authorization.middleware.ts";

const adminAuditLogRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin-Audit-Logs
 *   description: Admin action audit log endpoints
 */

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: List admin audit logs
 *     tags: [Admin-Audit-Logs]
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
 *         name: adminId
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: targetType
 *         schema:
 *           type: string
 *       - in: query
 *         name: targetId
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
 *         description: Admin audit logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 */
adminAuditLogRouter.get(
  "/audit-logs",
  protect,
  checkRole("ADMIN"),
  adminAuditLogController.getAll,
);

export default adminAuditLogRouter;
