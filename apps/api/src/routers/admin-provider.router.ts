import express from "express";
import { adminProviderController } from "../controllers/admin-provider.controller.ts";
import { protect } from "../middlewares/protect.middleware.ts";
import { checkRole } from "../middlewares/authorization.middleware.ts";

const adminProviderRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin-Providers
 *   description: Admin provider verification endpoints
 */

/**
 * @swagger
 * /api/admin/providers:
 *   get:
 *     summary: List providers for admin
 *     description: Admin lists providers with optional filters and providerStatus query.
 *     tags: [Admin-Providers]
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
 *         name: providerStatus
 *         schema:
 *           type: string
 *           enum: [PENDING_VERIFICATION, VERIFIED, REJECTED, SUSPENDED]
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *         description: 'JSON string, e.g. {"businessName":"spa"}'
 *     responses:
 *       200:
 *         description: Admin providers retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 */
adminProviderRouter.get(
  "/providers",
  protect,
  checkRole("ADMIN"),
  adminProviderController.getAll,
);

/**
 * @swagger
 * /api/admin/providers/pending:
 *   get:
 *     summary: List pending provider applications
 *     description: Admin retrieves providers waiting for verification, including document summary counts.
 *     tags: [Admin-Providers]
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
 *         name: filters
 *         schema:
 *           type: string
 *         description: 'JSON string, e.g. {"businessName":"spa"}'
 *     responses:
 *       200:
 *         description: Pending providers retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 */
adminProviderRouter.get(
  "/providers/pending",
  protect,
  checkRole("ADMIN"),
  adminProviderController.getPending,
);

/**
 * @swagger
 * /api/admin/providers/{id}:
 *   get:
 *     summary: Get provider detail for admin
 *     description: Admin retrieves provider detail with verification documents.
 *     tags: [Admin-Providers]
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
 *         description: Admin provider retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Provider not found
 */
adminProviderRouter.get(
  "/providers/:id",
  protect,
  checkRole("ADMIN"),
  adminProviderController.getById,
);

/**
 * @swagger
 * /api/admin/providers/{id}/verify:
 *   patch:
 *     summary: Verify a provider
 *     description: Admin verifies a provider application. Provider status becomes VERIFIED.
 *     tags: [Admin-Providers]
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
 *         description: Provider verified successfully
 *       400:
 *         description: Provider is already verified
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Provider not found
 */
adminProviderRouter.patch(
  "/providers/:id/verify",
  protect,
  checkRole("ADMIN"),
  adminProviderController.verify,
);

/**
 * @swagger
 * /api/admin/providers/{id}/reject:
 *   patch:
 *     summary: Reject a provider
 *     description: Admin rejects a provider application with a reason.
 *     tags: [Admin-Providers]
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
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Missing business license"
 *     responses:
 *       200:
 *         description: Provider rejected successfully
 *       400:
 *         description: Missing reason or provider cannot be rejected
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Provider not found
 */
adminProviderRouter.patch(
  "/providers/:id/reject",
  protect,
  checkRole("ADMIN"),
  adminProviderController.reject,
);

/**
 * @swagger
 * /api/admin/providers/{id}/suspend:
 *   patch:
 *     summary: Suspend a verified provider
 *     description: Admin suspends a verified provider with an optional reason.
 *     tags: [Admin-Providers]
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
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Policy violation"
 *     responses:
 *       200:
 *         description: Provider suspended successfully
 *       400:
 *         description: Provider is not verified
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Provider not found
 */
adminProviderRouter.patch(
  "/providers/:id/suspend",
  protect,
  checkRole("ADMIN"),
  adminProviderController.suspend,
);

export default adminProviderRouter;
