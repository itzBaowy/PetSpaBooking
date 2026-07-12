import express from "express";
import { adminWithdrawalController } from "../controllers/admin-withdrawal.controller.ts";
import { protect } from "../middlewares/protect.middleware.ts";
import { checkRole } from "../middlewares/authorization.middleware.ts";

const adminWithdrawalRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin-Withdrawals
 *   description: Admin provider withdrawal approval endpoints
 */

/**
 * @swagger
 * /api/admin/withdrawals:
 *   get:
 *     summary: List withdrawal requests
 *     tags: [Admin-Withdrawals]
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
 *           enum: [PENDING, APPROVED, REJECTED, PAID]
 *     responses:
 *       200:
 *         description: Withdrawal requests retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 */
adminWithdrawalRouter.get(
  "/withdrawals",
  protect,
  checkRole("ADMIN"),
  adminWithdrawalController.getAll,
);

/**
 * @swagger
 * /api/admin/withdrawals/{id}:
 *   get:
 *     summary: Get withdrawal request detail
 *     tags: [Admin-Withdrawals]
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
 *         description: Withdrawal request retrieved successfully
 *       404:
 *         description: Withdrawal request not found
 */
adminWithdrawalRouter.get(
  "/withdrawals/:id",
  protect,
  checkRole("ADMIN"),
  adminWithdrawalController.getById,
);

/**
 * @swagger
 * /api/admin/withdrawals/{id}/approve:
 *   patch:
 *     summary: Approve a pending withdrawal
 *     tags: [Admin-Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminNote:
 *                 type: string
 *                 example: "Approved for payout"
 *     responses:
 *       200:
 *         description: Withdrawal request approved successfully
 *       400:
 *         description: Only pending withdrawals can be approved
 */
adminWithdrawalRouter.patch(
  "/withdrawals/:id/approve",
  protect,
  checkRole("ADMIN"),
  adminWithdrawalController.approve,
);

/**
 * @swagger
 * /api/admin/withdrawals/{id}/reject:
 *   patch:
 *     summary: Reject a pending withdrawal
 *     tags: [Admin-Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - adminNote
 *             properties:
 *               adminNote:
 *                 type: string
 *                 example: "Bank account information is invalid"
 *     responses:
 *       200:
 *         description: Withdrawal request rejected successfully
 *       400:
 *         description: Only pending withdrawals can be rejected
 */
adminWithdrawalRouter.patch(
  "/withdrawals/:id/reject",
  protect,
  checkRole("ADMIN"),
  adminWithdrawalController.reject,
);

/**
 * @swagger
 * /api/admin/withdrawals/{id}/mark-paid:
 *   patch:
 *     summary: Mark approved withdrawal as paid
 *     description: Deducts provider wallet balance and writes a WITHDRAWAL_PAYOUT wallet transaction.
 *     tags: [Admin-Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminNote:
 *                 type: string
 *                 example: "Paid via bank transfer"
 *     responses:
 *       200:
 *         description: Withdrawal request marked as paid successfully
 *       400:
 *         description: Only approved withdrawals can be paid or provider balance is insufficient
 */
adminWithdrawalRouter.patch(
  "/withdrawals/:id/mark-paid",
  protect,
  checkRole("ADMIN"),
  adminWithdrawalController.markPaid,
);

export default adminWithdrawalRouter;
