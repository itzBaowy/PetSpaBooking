import express from "express";
import { mobileBookingController } from "../../controllers/mobile-controllers/booking.controller.ts";
import { protect } from "../../middlewares/protect.middleware.ts";
import { checkRole } from "../../middlewares/authorization.middleware.ts";

const mobileBookingRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Mobile-Bookings
 *   description: Mobile booking endpoints
 */

/**
 * @swagger
 * /api/mobile/bookings:
 *   post:
 *     summary: Create a booking
 *     description: Customer creates a booking for an active service from a verified provider with active deposit.
 *     tags: [Mobile-Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - providerId
 *               - serviceId
 *               - appointmentStart
 *             properties:
 *               providerId:
 *                 type: string
 *                 example: "64f1a2b3c4d5e6f789012345"
 *               serviceId:
 *                 type: string
 *                 example: "64f1a2b3c4d5e6f789012346"
 *               petId:
 *                 type: string
 *                 nullable: true
 *                 example: "64f1a2b3c4d5e6f789012347"
 *               appointmentStart:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-07-12T10:00:00.000Z"
 *               paymentMethod:
 *                 type: string
 *                 enum: [CASH, ONLINE]
 *                 default: CASH
 *                 example: CASH
 *               note:
 *                 type: string
 *                 nullable: true
 *                 example: "Please be gentle with my pet."
 *               customerLocation:
 *                 type: string
 *                 nullable: true
 *                 example: "Ho Chi Minh City"
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Invalid input or provider/service is not bookable
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer role required
 */
mobileBookingRouter.post(
  "/bookings",
  protect,
  checkRole("CUSTOMER"),
  mobileBookingController.create,
);

/**
 * @swagger
 * /api/mobile/me/bookings:
 *   get:
 *     summary: Get my bookings
 *     description: Customer retrieves their own bookings, optionally filtered by booking status.
 *     tags: [Mobile-Bookings]
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
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer role required
 */
mobileBookingRouter.get(
  "/me/bookings",
  protect,
  checkRole("CUSTOMER"),
  mobileBookingController.getMyBookings,
);

/**
 * @swagger
 * /api/mobile/me/bookings/{id}:
 *   get:
 *     summary: Get my booking detail
 *     description: Customer retrieves one booking that belongs to them.
 *     tags: [Mobile-Bookings]
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
 *         description: Booking retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer role required
 *       404:
 *         description: Booking not found
 */
mobileBookingRouter.get(
  "/me/bookings/:id",
  protect,
  checkRole("CUSTOMER"),
  mobileBookingController.getMyBookingById,
);

/**
 * @swagger
 * /api/mobile/me/bookings/{id}/qr:
 *   get:
 *     summary: Generate booking QR token
 *     description: Customer generates a signed QR token for CHECK_IN or CHECK_OUT. The frontend renders this token as a QR code.
 *     tags: [Mobile-Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *       - in: query
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           enum: [CHECK_IN, CHECK_OUT]
 *         description: QR action to generate
 *     responses:
 *       200:
 *         description: Booking QR token generated successfully
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
 *                   example: Booking QR token generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookingId:
 *                       type: string
 *                     action:
 *                       type: string
 *                       enum: [CHECK_IN, CHECK_OUT]
 *                     qrToken:
 *                       type: string
 *                     expiresInSeconds:
 *                       type: integer
 *                       example: 600
 *       400:
 *         description: Booking status does not allow this QR action
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer role required
 *       404:
 *         description: Booking not found
 */
mobileBookingRouter.get(
  "/me/bookings/:id/qr",
  protect,
  checkRole("CUSTOMER"),
  mobileBookingController.getMyBookingQr,
);

/**
 * @swagger
 * /api/mobile/bookings/{id}/momo/create-payment:
 *   post:
 *     summary: Create MoMo sandbox payment
 *     description: Customer creates a MoMo captureWallet payment for their ONLINE booking. Frontend redirects user to payUrl.
 *     tags: [Mobile-Bookings]
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
 *       201:
 *         description: MoMo payment created successfully
 *       400:
 *         description: Booking is not payable online or MoMo config is missing
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer role required
 *       404:
 *         description: Booking not found
 */
mobileBookingRouter.post(
  "/bookings/:id/momo/create-payment",
  protect,
  checkRole("CUSTOMER"),
  mobileBookingController.createMomoPayment,
);

/**
 * @swagger
 * /api/mobile/payments/momo/ipn:
 *   post:
 *     summary: MoMo IPN callback
 *     description: Public server-to-server callback from MoMo. Backend verifies signature and updates booking payment status.
 *     tags: [Mobile-Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: MoMo IPN processed successfully
 *       400:
 *         description: Invalid MoMo signature or payload
 */
mobileBookingRouter.post(
  "/payments/momo/ipn",
  mobileBookingController.handleMomoIpn,
);

/**
 * @swagger
 * /api/mobile/payments/momo/return:
 *   get:
 *     summary: MoMo return callback
 *     description: Public browser return URL from MoMo. Backend verifies signature and updates booking payment status.
 *     tags: [Mobile-Bookings]
 *     responses:
 *       200:
 *         description: MoMo return processed successfully
 *       400:
 *         description: Invalid MoMo signature or payload
 */
mobileBookingRouter.get(
  "/payments/momo/return",
  mobileBookingController.handleMomoReturn,
);

/**
 * @swagger
 * /api/mobile/bookings/{id}/disputes:
 *   post:
 *     summary: Create a booking dispute
 *     description: Customer creates a dispute for their own CHECKED_OUT booking during the configured dispute window.
 *     tags: [Mobile-Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Service quality issue"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: "The service was not completed as agreed."
 *     responses:
 *       201:
 *         description: Booking dispute created successfully
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
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Booking dispute created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     bookingId:
 *                       type: string
 *                     reason:
 *                       type: string
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     status:
 *                       type: string
 *                       example: PENDING
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Booking is not CHECKED_OUT, dispute window expired, or dispute already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer role required
 *       404:
 *         description: Booking not found
 */
mobileBookingRouter.post(
  "/bookings/:id/disputes",
  protect,
  checkRole("CUSTOMER"),
  mobileBookingController.createDispute,
);

/**
 * @swagger
 * /api/mobile/bookings/{id}/reviews:
 *   post:
 *     summary: Create a review for a completed booking
 *     description: Customer reviews their own COMPLETED booking. One booking can only have one review.
 *     tags: [Mobile-Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 nullable: true
 *                 example: "Great service"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://res.cloudinary.com/.../review.jpg"]
 *     responses:
 *       201:
 *         description: Booking review created successfully
 *       400:
 *         description: Booking is not COMPLETED, already reviewed, or invalid rating
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer role required
 *       404:
 *         description: Booking not found
 */
mobileBookingRouter.post(
  "/bookings/:id/reviews",
  protect,
  checkRole("CUSTOMER"),
  mobileBookingController.createReview,
);

/**
 * @swagger
 * /api/mobile/provider/bookings:
 *   get:
 *     summary: Get provider bookings
 *     description: Provider retrieves bookings assigned to their own provider profile.
 *     tags: [Mobile-Bookings]
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
 *     responses:
 *       200:
 *         description: Provider bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Provider role and active deposit required
 */
mobileBookingRouter.get(
  "/provider/bookings",
  protect,
  checkRole("PROVIDER"),
  mobileBookingController.getProviderBookings,
);

/**
 * @swagger
 * /api/mobile/provider/bookings/{id}/confirm:
 *   patch:
 *     summary: Confirm a pending booking
 *     description: Provider confirms their own PENDING booking. Status changes to CONFIRMED.
 *     tags: [Mobile-Bookings]
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
 *         description: Booking confirmed successfully
 *       400:
 *         description: Booking is not PENDING
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Provider role and active deposit required
 *       404:
 *         description: Booking not found
 */
mobileBookingRouter.patch(
  "/provider/bookings/:id/confirm",
  protect,
  checkRole("PROVIDER"),
  mobileBookingController.confirm,
);

/**
 * @swagger
 * /api/mobile/provider/bookings/{id}/reject:
 *   patch:
 *     summary: Reject a pending booking
 *     description: Provider rejects their own PENDING booking. Status changes to REJECTED.
 *     tags: [Mobile-Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               reason:
 *                 type: string
 *                 example: "Provider is unavailable"
 *     responses:
 *       200:
 *         description: Booking rejected successfully
 *       400:
 *         description: Booking is not PENDING
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Provider role and active deposit required
 *       404:
 *         description: Booking not found
 */
mobileBookingRouter.patch(
  "/provider/bookings/:id/reject",
  protect,
  checkRole("PROVIDER"),
  mobileBookingController.reject,
);

/**
 * @swagger
 * /api/mobile/provider/bookings/{id}/check-in:
 *   post:
 *     summary: Check in a confirmed booking
 *     description: Provider scans a customer CHECK_IN QR token. Status changes from CONFIRMED to CHECKED_IN.
 *     tags: [Mobile-Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - qrToken
 *             properties:
 *               qrToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Booking checked in successfully
 *       400:
 *         description: Invalid QR token or booking is not CONFIRMED
 *       401:
 *         description: Unauthorized or QR token expired
 *       403:
 *         description: Provider role and active deposit required
 *       404:
 *         description: Booking not found
 */
mobileBookingRouter.post(
  "/provider/bookings/:id/check-in",
  protect,
  checkRole("PROVIDER"),
  mobileBookingController.checkIn,
);

/**
 * @swagger
 * /api/mobile/provider/bookings/{id}/check-out:
 *   post:
 *     summary: Check out a checked-in booking
 *     description: Provider scans a customer CHECK_OUT QR token. Status changes from CHECKED_IN to CHECKED_OUT.
 *     tags: [Mobile-Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - qrToken
 *             properties:
 *               qrToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Booking checked out successfully
 *       400:
 *         description: Invalid QR token or booking is not CHECKED_IN
 *       401:
 *         description: Unauthorized or QR token expired
 *       403:
 *         description: Provider role and active deposit required
 *       404:
 *         description: Booking not found
 */
mobileBookingRouter.post(
  "/provider/bookings/:id/check-out",
  protect,
  checkRole("PROVIDER"),
  mobileBookingController.checkOut,
);

export default mobileBookingRouter;
