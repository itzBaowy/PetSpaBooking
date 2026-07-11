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
 *           enum: [ONLINE_EARNING, CASH_COMMISSION_DEDUCTION, DEPOSIT_COMMISSION_DEDUCTION]
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

export default providerRouterMobile;
