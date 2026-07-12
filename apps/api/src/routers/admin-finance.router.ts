import express from "express";
import { adminFinanceController } from "../controllers/admin-finance.controller.ts";
import { protect } from "../middlewares/protect.middleware.ts";
import { checkRole } from "../middlewares/authorization.middleware.ts";

const adminFinanceRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin-Finance
 *   description: Admin finance and wallet audit endpoints
 */

/**
 * @swagger
 * /api/admin/wallet-transactions:
 *   get:
 *     summary: List wallet transactions
 *     description: Admin audits wallet/deposit transactions with optional filters.
 *     tags: [Admin-Finance]
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
 *         name: providerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: bookingId
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ONLINE_EARNING, CASH_COMMISSION_DEDUCTION, DEPOSIT_COMMISSION_DEDUCTION, MANUAL_ADJUSTMENT, WITHDRAWAL_PAYOUT]
 *       - in: query
 *         name: balanceType
 *         schema:
 *           type: string
 *           enum: [WALLET, DEPOSIT]
 *     responses:
 *       200:
 *         description: Wallet transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 */
adminFinanceRouter.get(
  "/wallet-transactions",
  protect,
  checkRole("ADMIN"),
  adminFinanceController.getWalletTransactions,
);

/**
 * @swagger
 * /api/admin/providers/{id}/wallet:
 *   get:
 *     summary: Get provider wallet audit
 *     description: Admin retrieves balances, transaction totals, and recent wallet transactions for a provider.
 *     tags: [Admin-Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Provider ID
 *     responses:
 *       200:
 *         description: Provider wallet audit retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Provider not found
 */
adminFinanceRouter.get(
  "/providers/:id/wallet",
  protect,
  checkRole("ADMIN"),
  adminFinanceController.getProviderWallet,
);

/**
 * @swagger
 * /api/admin/providers/{id}/wallet/adjust:
 *   post:
 *     summary: Manually adjust provider wallet or deposit
 *     description: Admin adjusts a provider WALLET or DEPOSIT balance and writes a MANUAL_ADJUSTMENT ledger transaction.
 *     tags: [Admin-Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Provider ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - balanceType
 *               - amount
 *               - reason
 *             properties:
 *               balanceType:
 *                 type: string
 *                 enum: [WALLET, DEPOSIT]
 *                 example: WALLET
 *               amount:
 *                 type: number
 *                 example: 50000
 *                 description: Positive amount adds balance; negative amount subtracts balance.
 *               reason:
 *                 type: string
 *                 example: "Manual compensation"
 *     responses:
 *       201:
 *         description: Provider wallet adjusted successfully
 *       400:
 *         description: Invalid amount, reason, balance type, or negative resulting balance
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Provider not found
 */
adminFinanceRouter.post(
  "/providers/:id/wallet/adjust",
  protect,
  checkRole("ADMIN"),
  adminFinanceController.adjustProviderWallet,
);

/**
 * @swagger
 * /api/admin/bookings/{id}/finance:
 *   get:
 *     summary: Get booking finance audit
 *     description: Admin retrieves payment, commission, dispute, provider, and ledger information for one booking.
 *     tags: [Admin-Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking finance audit retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Booking not found
 */
adminFinanceRouter.get(
  "/bookings/:id/finance",
  protect,
  checkRole("ADMIN"),
  adminFinanceController.getBookingFinance,
);

/**
 * @swagger
 * /api/admin/refunds:
 *   get:
 *     summary: List refund requests
 *     description: Admin lists ONLINE bookings with paymentStatus REFUND_PENDING.
 *     tags: [Admin-Finance]
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
 *     responses:
 *       200:
 *         description: Refund requests retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 */
adminFinanceRouter.get(
  "/refunds",
  protect,
  checkRole("ADMIN"),
  adminFinanceController.getRefunds,
);

/**
 * @swagger
 * /api/admin/refunds/{bookingId}:
 *   get:
 *     summary: Get refund request detail
 *     description: Admin retrieves one REFUND_PENDING booking and related payment transactions.
 *     tags: [Admin-Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Refund request retrieved successfully
 *       404:
 *         description: Refund request not found
 */
adminFinanceRouter.get(
  "/refunds/:bookingId",
  protect,
  checkRole("ADMIN"),
  adminFinanceController.getRefundByBookingId,
);

/**
 * @swagger
 * /api/admin/refunds/{bookingId}/mark-refunded:
 *   patch:
 *     summary: Mark refund as completed
 *     description: Admin manually marks a REFUND_PENDING booking as REFUNDED after refunding outside the system.
 *     tags: [Admin-Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refundReference:
 *                 type: string
 *                 example: "MOMO_REFUND_123"
 *               adminNote:
 *                 type: string
 *                 example: "Refunded manually from MoMo dashboard"
 *     responses:
 *       200:
 *         description: Refund marked as completed successfully
 *       404:
 *         description: Refund request not found
 */
adminFinanceRouter.patch(
  "/refunds/:bookingId/mark-refunded",
  protect,
  checkRole("ADMIN"),
  adminFinanceController.markRefunded,
);

/**
 * @swagger
 * /api/admin/refunds/{bookingId}/reject:
 *   patch:
 *     summary: Reject refund request
 *     description: Admin rejects a REFUND_PENDING booking and restores paymentStatus to SUCCESS.
 *     tags: [Admin-Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
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
 *                 example: "Refund rejected due to policy"
 *     responses:
 *       200:
 *         description: Refund rejected successfully
 *       400:
 *         description: Missing adminNote
 *       404:
 *         description: Refund request not found
 */
adminFinanceRouter.patch(
  "/refunds/:bookingId/reject",
  protect,
  checkRole("ADMIN"),
  adminFinanceController.rejectRefund,
);

export default adminFinanceRouter;
