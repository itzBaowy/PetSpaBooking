import express from "express";
import { adminSystemSettingController } from "../controllers/admin-system-setting.controller.ts";
import { checkRole } from "../middlewares/authorization.middleware.ts";
import { protect } from "../middlewares/protect.middleware.ts";

const adminSystemSettingRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin-Settings
 *   description: Admin system settings endpoints
 */

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: Get system settings
 *     tags: [Admin-Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings retrieved successfully
 */
adminSystemSettingRouter.get(
  "/settings",
  protect,
  checkRole("ADMIN"),
  adminSystemSettingController.getAll,
);

/**
 * @swagger
 * /api/admin/settings:
 *   patch:
 *     summary: Update system settings
 *     tags: [Admin-Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               minProviderDeposit:
 *                 type: number
 *                 example: 300000
 *               platformCommissionRate:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *                 example: 0.15
 *               bookingAutoCompleteHours:
 *                 type: number
 *                 example: 10
 *               bookingNoArrivalGraceMinutes:
 *                 type: number
 *                 example: 15
 *               minWithdrawalAmount:
 *                 type: number
 *                 example: 100000
 *     responses:
 *       200:
 *         description: System settings updated successfully
 *       400:
 *         description: Invalid setting payload
 */
adminSystemSettingRouter.patch(
  "/settings",
  protect,
  checkRole("ADMIN"),
  adminSystemSettingController.update,
);

export default adminSystemSettingRouter;
