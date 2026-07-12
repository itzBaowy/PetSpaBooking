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
 *           enum: [ONLINE_EARNING, CASH_COMMISSION_DEDUCTION, DEPOSIT_COMMISSION_DEDUCTION, MANUAL_ADJUSTMENT, WITHDRAWAL_PAYOUT]
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
 * /api/mobile/provider/withdrawals:
 *   post:
 *     summary: Create a provider withdrawal request
 *     description: Provider requests a withdrawal from wallet balance. Balance is deducted only when admin marks the request as PAID.
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
