import express from "express";
import { adminBookingController } from "../controllers/admin-booking.controller.ts";
import { protect } from "../middlewares/protect.middleware.ts";
import { checkRole } from "../middlewares/authorization.middleware.ts";

const adminBookingRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin-Bookings
 *   description: Admin booking management endpoints
 */

/**
 * @swagger
 * /api/admin/bookings:
 *   get:
 *     summary: List bookings for admin
 *     description: Admin lists bookings across the system with status, payment, provider, customer, and date filters.
 *     tags: [Admin-Bookings]
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
 *           enum: [PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, COMPLETED, CANCELLED, REJECTED, DISPUTE, NO_ARRIVAL]
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [CASH, ONLINE]
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [UNPAID, PENDING, SUCCESS, FAILED, REFUNDED]
 *       - in: query
 *         name: bookingId
 *         schema:
 *           type: string
 *       - in: query
 *         name: providerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter appointmentStart greater than or equal to this date.
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter appointmentStart less than or equal to this date.
 *     responses:
 *       200:
 *         description: Admin bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 */
adminBookingRouter.get(
  "/bookings",
  protect,
  checkRole("ADMIN"),
  adminBookingController.getAll,
);

/**
 * @swagger
 * /api/admin/bookings/auto-complete/run:
 *   post:
 *     summary: Manually run booking auto-complete scan
 *     description: Admin manually scans CHECKED_OUT bookings past the hold period and completes eligible bookings immediately instead of waiting for the cron job.
 *     tags: [Admin-Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking auto-complete scan completed successfully
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
 *                   example: Booking auto-complete scan completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     completedCount:
 *                       type: integer
 *                       example: 3
 *                     holdHours:
 *                       type: number
 *                       example: 10
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 */
adminBookingRouter.post(
  "/bookings/auto-complete/run",
  protect,
  checkRole("ADMIN"),
  adminBookingController.runAutoCompleteScan,
);

/**
 * @swagger
 * /api/admin/bookings/{id}:
 *   get:
 *     summary: Get booking detail for admin
 *     description: Admin retrieves one booking with customer, provider, service, dispute, review, and wallet transaction details.
 *     tags: [Admin-Bookings]
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
 *         description: Admin booking retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Booking not found
 */
adminBookingRouter.get(
  "/bookings/:id",
  protect,
  checkRole("ADMIN"),
  adminBookingController.getById,
);

export default adminBookingRouter;
