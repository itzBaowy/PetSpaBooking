import express from "express";
import { providerController } from "../controllers/provider.controller.ts";
import { protect } from "../middlewares/protect.middleware.ts";
import { checkRole } from "../middlewares/authorization.middleware.ts";

const providerRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Providers
 *   description: Provider registration, profile management, and admin verification
 */

// ─────────────────────────────────────────────────────────────────────────────
// SELF-SERVICE — authenticated user (any role with a provider profile)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/providers/register:
 *   post:
 *     summary: Register as a provider (authenticated users only)
 *     description: Any authenticated CUSTOMER can submit a provider application. Status starts as PENDING_VERIFICATION.
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterProviderRequest'
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProviderObject'
 *       400:
 *         description: Already registered or missing fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
providerRouter.post("/register", protect, providerController.register);

/**
 * @swagger
 * /api/providers/me:
 *   get:
 *     summary: Get my provider profile
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Provider profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProviderObject'
 *       404:
 *         description: No provider profile found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
providerRouter.get("/me", protect, providerController.getMe);

/**
 * @swagger
 * /api/providers/me:
 *   put:
 *     summary: Update my provider profile
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProviderRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProviderObject'
 *       404:
 *         description: Provider profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
providerRouter.put("/me", protect, providerController.updateMe);

/**
 * @swagger
 * /api/providers/me/documents:
 *   get:
 *     summary: Get my verification documents
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Documents retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProviderDocumentObject'
 */
providerRouter.get("/me/documents", protect, providerController.getMyDocuments);

/**
 * @swagger
 * /api/providers/me/documents:
 *   post:
 *     summary: Upload a verification document image
 *     description: Frontend uploads image to Cloudinary first, then sends the URL here.
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UploadDocumentRequest'
 *     responses:
 *       201:
 *         description: Document uploaded
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProviderDocumentObject'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
providerRouter.post("/me/documents", protect, providerController.uploadDocument);

/**
 * @swagger
 * /api/providers/me/documents/{docId}:
 *   delete:
 *     summary: Delete a verification document (only if status is PENDING)
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: docId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the document
 *     responses:
 *       200:
 *         description: Document deleted
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *       400:
 *         description: Cannot delete a reviewed document
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
providerRouter.delete("/me/documents/:docId", protect, providerController.deleteDocument);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN endpoints
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/providers:
 *   get:
 *     summary: Get all providers (Admin only)
 *     tags: [Providers]
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
 *         description: 'JSON string, e.g: {"businessName":"spa"}'
 *       - in: query
 *         name: providerStatus
 *         schema:
 *           type: string
 *           enum: [PENDING_VERIFICATION, VERIFIED, REJECTED, SUSPENDED]
 *         description: Filter by provider status
 *     responses:
 *       200:
 *         description: Providers list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProviderListResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
providerRouter.get("/", protect, checkRole("ADMIN"), providerController.getAll);

/**
 * @swagger
 * /api/providers/{id}:
 *   get:
 *     summary: Get provider by ID with documents (Admin only)
 *     tags: [Providers]
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
 *         description: Provider detail with documents
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProviderDetailObject'
 *       404:
 *         description: Provider not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
providerRouter.get("/:id", protect, checkRole("ADMIN"), providerController.getById);

/**
 * @swagger
 * /api/providers/{id}/approve:
 *   patch:
 *     summary: Approve a provider application (Admin only)
 *     description: Sets providerStatus to VERIFIED and user role to PROVIDER.
 *     tags: [Providers]
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
 *         description: Provider approved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProviderObject'
 *       400:
 *         description: Already verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Provider not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
providerRouter.patch("/:id/approve", protect, checkRole("ADMIN"), providerController.approve);

/**
 * @swagger
 * /api/providers/{id}/reject:
 *   patch:
 *     summary: Reject a provider application (Admin only)
 *     tags: [Providers]
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
 *             $ref: '#/components/schemas/RejectProviderRequest'
 *     responses:
 *       200:
 *         description: Provider rejected
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProviderObject'
 *       400:
 *         description: Missing reason or invalid status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
providerRouter.patch("/:id/reject", protect, checkRole("ADMIN"), providerController.reject);

/**
 * @swagger
 * /api/providers/{id}/suspend:
 *   patch:
 *     summary: Suspend a verified provider (Admin only)
 *     description: Sets providerStatus to SUSPENDED and reverts user role to CUSTOMER.
 *     tags: [Providers]
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
 *             $ref: '#/components/schemas/SuspendProviderRequest'
 *     responses:
 *       200:
 *         description: Provider suspended
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProviderObject'
 *       400:
 *         description: Provider is not verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
providerRouter.patch("/:id/suspend", protect, checkRole("ADMIN"), providerController.suspend);

export default providerRouter;
