import express from "express";
import { mobileProviderController } from "../../controllers/mobile-controllers/provider.controller.ts";
import { protect } from "../../middlewares/protect.middleware.ts";
import { checkRole } from "../../middlewares/authorization.middleware.ts";

const providerRouterMobile = express.Router();

/**
 * @swagger
 * tags:
 *   name: Mobile-Provider
 *   description: Providers endpoint only use for Mobile
 */

/**
 * @swagger
 * /api/mobile/providers:
 *   get:
 *     summary: Get all providers for mobile
 *     description: Retrieve all active providers with calculated distance based on user coordinates.
 *     tags: [Mobile-Provider]
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
 *         name: userLat
 *         schema:
 *           type: number
 *         description: User latitude
 *       - in: query
 *         name: userLng
 *         schema:
 *           type: number
 *         description: User longitude
 *       - in: query
 *         name: searchKey
 *         schema:
 *           type: string
 *         description: Search by provider name, slug, or service name
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Minimum provider average rating
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Maximum provider average rating
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum service price range
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum service price range
 *     responses:
 *       200:
 *         description: List of providers for mobile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
providerRouterMobile.get(
  "/providers",
  mobileProviderController.getAllProviders,
);

/**
 * @swagger
 * /api/mobile/search:
 *   get:
 *     summary: Global search across providers and services for mobile
 *     description: Search by provider name, slug, service name, or provider description in one endpoint.
 *     tags: [Mobile-Provider]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword for provider or service names
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
 *         name: userLat
 *         schema:
 *           type: number
 *         description: User latitude
 *       - in: query
 *         name: userLng
 *         schema:
 *           type: number
 *         description: User longitude
 *     responses:
 *       200:
 *         description: Global search results for mobile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MobileGlobalSearchResponse'
 */
providerRouterMobile.get("/search", mobileProviderController.searchGlobal);

/**
 * @swagger
 * /api/mobile/providers/provider-detail/{providerId}:
 *   get:
 *     summary: Get provider detail for mobile
 *     description: Retrieve detailed information about a specific provider.
 *     tags: [Mobile-Provider]
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Provider ID
 *       - in: query
 *         name: userLat
 *         schema:
 *           type: number
 *         description: User latitude
 *       - in: query
 *         name: userLng
 *         schema:
 *           type: number
 *         description: User longitude
 *     responses:
 *       200:
 *         description: Provider detail for mobile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MobileProviderDetailResponse'
 */
providerRouterMobile.get(
  "/providers/provider-detail/:providerId",
  mobileProviderController.getProviderInfomation,
);

/**
 * @swagger
 * /api/mobile/providers/reviews/{providerId}:
 *   get:
 *     summary: Get all reviews by provider ID for mobile
 *     description: Retrieve all reviews of a provider.
 *     tags: [Mobile-Provider]
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Provider ID
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
 *         description: List of reviews for mobile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MobileReviewListResponse'
 */
providerRouterMobile.get(
  "/providers/reviews/:providerId",
  mobileProviderController.getAllReviewByProviderId,
);

/**
 * @swagger
 * /api/mobile/providers/{providerId}/available-slots:
 *   get:
 *     summary: Get provider available booking slots
 *     description: Returns bookable slots for a provider/service/date after working-hours, blocks, and existing-booking checks.
 *     tags: [Mobile-Provider]
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Provider ID
 *       - in: query
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2026-07-20"
 *         description: Date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: Provider available slots retrieved successfully
 *       400:
 *         description: Invalid providerId, serviceId, or date
 *       404:
 *         description: Provider or service not found
 */
providerRouterMobile.get(
  "/providers/:providerId/available-slots",
  mobileProviderController.getAvailableSlots,
);

/**
 * @swagger
 * /api/mobile/provider/working-hours:
 *   get:
 *     summary: Get provider working hours
 *     description: Provider retrieves their own weekly working hours.
 *     tags: [Mobile-Provider]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Provider working hours retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Provider role required
 */
providerRouterMobile.get(
  "/provider/working-hours",
  protect,
  checkRole("PROVIDER"),
  mobileProviderController.getWorkingHours,
);

/**
 * @swagger
 * /api/mobile/provider/working-hours:
 *   put:
 *     summary: Update provider working hours
 *     description: Provider replaces their weekly working-hours config.
 *     tags: [Mobile-Provider]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - dayOfWeek
 *                     - openTime
 *                     - closeTime
 *                     - isClosed
 *                   properties:
 *                     dayOfWeek:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                       example: 1
 *                     openTime:
 *                       type: string
 *                       example: "08:00"
 *                     closeTime:
 *                       type: string
 *                       example: "18:00"
 *                     isClosed:
 *                       type: boolean
 *                       example: false
 *     responses:
 *       200:
 *         description: Provider working hours updated successfully
 *       400:
 *         description: Invalid working-hours payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Provider role required
 */
providerRouterMobile.put(
  "/provider/working-hours",
  protect,
  checkRole("PROVIDER"),
  mobileProviderController.updateWorkingHours,
);

/**
 * @swagger
 * /api/mobile/provider/availability-blocks:
 *   get:
 *     summary: Get provider availability blocks
 *     description: Provider retrieves custom blocked time ranges.
 *     tags: [Mobile-Provider]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Provider availability blocks retrieved successfully
 */
providerRouterMobile.get(
  "/provider/availability-blocks",
  protect,
  checkRole("PROVIDER"),
  mobileProviderController.getAvailabilityBlocks,
);

/**
 * @swagger
 * /api/mobile/provider/availability-blocks:
 *   post:
 *     summary: Create provider availability block
 *     description: Provider blocks a custom time range from receiving bookings. Blocks cannot overlap active bookings; provider must resolve/cancel the booking first.
 *     tags: [Mobile-Provider]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startAt
 *               - endAt
 *             properties:
 *               startAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-07-20T03:00:00.000Z"
 *               endAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-07-20T05:00:00.000Z"
 *               reason:
 *                 type: string
 *                 nullable: true
 *                 example: "Personal day off"
 *     responses:
 *       201:
 *         description: Provider availability block created successfully
 *       400:
 *         description: Invalid block, overlapping block, or active booking exists in the selected time range
 */
providerRouterMobile.post(
  "/provider/availability-blocks",
  protect,
  checkRole("PROVIDER"),
  mobileProviderController.createAvailabilityBlock,
);

/**
 * @swagger
 * /api/mobile/provider/availability-blocks/{id}:
 *   delete:
 *     summary: Delete provider availability block
 *     description: Provider deletes one of their custom blocked time ranges.
 *     tags: [Mobile-Provider]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Availability block ID
 *     responses:
 *       200:
 *         description: Provider availability block deleted successfully
 *       404:
 *         description: Availability block not found
 */
providerRouterMobile.delete(
  "/provider/availability-blocks/:id",
  protect,
  checkRole("PROVIDER"),
  mobileProviderController.deleteAvailabilityBlock,
);

/**
 * @swagger
 * /api/mobile/provider/wallet:
 *   get:
 *     summary: Get provider wallet
 *     description: Provider retrieves wallet and deposit balances.
 *     tags: [Mobile-Provider]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Provider wallet retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Provider role required
 *       404:
 *         description: Provider profile not found
 */
providerRouterMobile.get(
  "/provider/wallet",
  protect,
  checkRole("PROVIDER"),
  mobileProviderController.getWallet,
);

/**
 * @swagger
 * /api/mobile/provider/wallet/transactions:
 *   get:
 *     summary: Get provider wallet transactions
 *     description: Provider retrieves wallet/deposit transactions, optionally filtered by transaction type.
 *     tags: [Mobile-Provider]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ONLINE_EARNING, CASH_COMMISSION_DEDUCTION, DEPOSIT_COMMISSION_DEDUCTION, CASH_REFUND_DEDUCTION, DEPOSIT_TOP_UP, MANUAL_ADJUSTMENT, WITHDRAWAL_PAYOUT, WITHDRAWAL_HOLD, WITHDRAWAL_RELEASE]
 *     responses:
 *       200:
 *         description: Provider wallet transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Provider role required
 *       404:
 *         description: Provider profile not found
 */
providerRouterMobile.get(
  "/provider/wallet/transactions",
  protect,
  checkRole("PROVIDER"),
  mobileProviderController.getWalletTransactions,
);

/**
 * @swagger
 * /api/mobile/provider/disputes:
 *   get:
 *     summary: Get provider disputes
 *     description: Provider retrieves disputes related to their bookings.
 *     tags: [Mobile-Provider]
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
 *         description: Provider disputes retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Provider role required
 */
providerRouterMobile.get(
  "/provider/disputes",
  protect,
  checkRole("PROVIDER"),
  mobileProviderController.getDisputes,
);

/**
 * @swagger
 * /api/mobile/provider/disputes/{id}:
 *   get:
 *     summary: Get provider dispute detail
 *     description: Provider retrieves a dispute related to their booking, including customer evidence and their own response.
 *     tags: [Mobile-Provider]
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
 *         description: Provider dispute retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Provider role required
 *       404:
 *         description: Dispute not found
 */
providerRouterMobile.get(
  "/provider/disputes/:id",
  protect,
  checkRole("PROVIDER"),
  mobileProviderController.getDisputeById,
);

/**
 * @swagger
 * /api/mobile/provider/disputes/{id}/response:
 *   post:
 *     summary: Respond to a pending dispute
 *     description: Provider submits their explanation and optional evidence for a PENDING dispute. Admin will review both sides before resolving.
 *     tags: [Mobile-Provider]
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
 *               - response
 *             properties:
 *               response:
 *                 type: string
 *                 example: "The service was completed as agreed. Please see attached checkout photos."
 *               evidence:
 *                 type: array
 *                 maxItems: 10
 *                 items:
 *                   type: object
 *                   required:
 *                     - url
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: "https://res.cloudinary.com/.../provider-proof.jpg"
 *                     type:
 *                       type: string
 *                       example: "IMAGE"
 *                     title:
 *                       type: string
 *                       example: "Checkout photo"
 *                     note:
 *                       type: string
 *                       example: "Photo taken at checkout."
 *     responses:
 *       200:
 *         description: Provider dispute response submitted successfully
 *       400:
 *         description: Dispute is not pending or invalid payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Provider role required
 *       404:
 *         description: Dispute not found
 */
providerRouterMobile.post(
  "/provider/disputes/:id/response",
  protect,
  checkRole("PROVIDER"),
  mobileProviderController.respondDispute,
);

/**
 * @swagger
 * /api/mobile/provider/withdrawals:
 *   post:
 *     summary: Create a provider withdrawal request
 *     description: Provider requests a withdrawal from wallet balance. The requested amount is held immediately to prevent duplicate/spam withdrawals. If admin rejects the request, the held amount is released back to the provider wallet.
 *     tags: [Mobile-Provider]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 100000
 *                 example: 200000
 *               reason:
 *                 type: string
 *                 nullable: true
 *                 example: "Monthly payout"
 *     responses:
 *       201:
 *         description: Withdrawal request created successfully
 *       400:
 *         description: Invalid amount, insufficient balance, missing bank account, or pending disputes
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Provider role required
 */
providerRouterMobile.post(
  "/provider/withdrawals",
  protect,
  checkRole("PROVIDER"),
  mobileProviderController.createWithdrawal,
);

/**
 * @swagger
 * /api/mobile/provider/withdrawals:
 *   get:
 *     summary: Get provider withdrawal requests
 *     description: Provider retrieves their own withdrawal requests.
 *     tags: [Mobile-Provider]
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
 *         description: Provider withdrawals retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Provider role required
 */
providerRouterMobile.get(
  "/provider/withdrawals",
  protect,
  checkRole("PROVIDER"),
  mobileProviderController.getWithdrawals,
);

export default providerRouterMobile;
