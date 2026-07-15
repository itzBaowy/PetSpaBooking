import express from "express";
import { serviceController } from "../controllers/service.controller.ts";
import { protect } from "../middlewares/protect.middleware.ts";
import { checkRole } from "../middlewares/authorization.middleware.ts";
import { uploadServiceImages } from "../common/multer/memory.multer.ts";

const serviceRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Pet spa service management (Provider self-service & Admin control)
 */

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — no auth required
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/services/public/{slug}:
 *   get:
 *     summary: Get all active services of a provider by slug (Public)
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Provider slug (e.g. happy-pet-spa)
 *     responses:
 *       200:
 *         description: List of active services
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
 *                         $ref: '#/components/schemas/ServiceObject'
 *       404:
 *         description: Provider not found or not verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
serviceRouter.get("/public/:slug", serviceController.getByProviderSlug);

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER — must be authenticated & have VERIFIED provider profile
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create a new service (Provider only — must be VERIFIED)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateServiceRequest'
 *     responses:
 *       201:
 *         description: Service created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ServiceObject'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not a verified provider
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
serviceRouter.post(
  "/",
  protect,
  checkRole("PROVIDER"),
  serviceController.create,
);

/**
 * @swagger
 * /api/services/images:
 *   post:
 *     summary: Upload service images to Cloudinary (Provider only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload 1-5 images. Allowed JPEG, PNG, WEBP. Max 8 MB/file.
 *     responses:
 *       201:
 *         description: Uploaded image URLs
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
 *                         imageUrls:
 *                           type: array
 *                           items:
 *                             type: string
 *                         images:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               url:
 *                                 type: string
 *                               publicId:
 *                                 type: string
 */
serviceRouter.post(
  "/images",
  protect,
  checkRole("PROVIDER"),
  uploadServiceImages,
  serviceController.uploadImages,
);

/**
 * @swagger
 * /api/services/my:
 *   get:
 *     summary: Get my services (Provider only)
 *     tags: [Services]
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
 *         name: category
 *         schema:
 *           type: string
 *           enum: [GROOMING, SPA, BOARDING, TRAINING, VETERINARY, OTHER]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by visibility (true = visible, false = hidden by provider)
 *     responses:
 *       200:
 *         description: Services list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ServiceListResponse'
 */
serviceRouter.get("/my", protect, checkRole("PROVIDER"), serviceController.getMy);

/**
 * @swagger
 * /api/services/{id}:
 *   put:
 *     summary: Update a service (Provider — own services only)
 *     tags: [Services]
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
 *             $ref: '#/components/schemas/UpdateServiceRequest'
 *     responses:
 *       200:
 *         description: Service updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ServiceObject'
 *       403:
 *         description: Not your service
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Service not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
serviceRouter.put(
  "/:id",
  protect,
  checkRole("PROVIDER"),
  serviceController.update,
);

/**
 * @swagger
 * /api/services/{id}/toggle:
 *   patch:
 *     summary: Toggle service visibility — isActive (Provider only)
 *     tags: [Services]
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
 *         description: Visibility toggled
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ServiceObject'
 */
serviceRouter.patch("/:id/toggle", protect, checkRole("PROVIDER"), serviceController.toggle);

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: Delete a service permanently (Provider — own services only)
 *     tags: [Services]
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
 *         description: Service deleted
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
 */
serviceRouter.delete("/:id", protect, checkRole("PROVIDER"), serviceController.remove);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get all services (Admin only)
 *     tags: [Services]
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
 *         description: 'JSON filter string, e.g: {"name":"spa"}'
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [GROOMING, SPA, BOARDING, TRAINING, VETERINARY, OTHER]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isHiddenByAdmin
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: All services
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ServiceListResponse'
 */
serviceRouter.get("/", protect, checkRole("ADMIN"), serviceController.getAll);

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Get a service by ID (Admin only)
 *     tags: [Services]
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
 *         description: Service detail
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ServiceObject'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
serviceRouter.get("/:id", protect, checkRole("ADMIN"), serviceController.getById);

/**
 * @swagger
 * /api/services/{id}/hide:
 *   patch:
 *     summary: Admin hide a service (Admin only)
 *     tags: [Services]
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
 *         description: Service hidden
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ServiceObject'
 */
serviceRouter.patch("/:id/hide", protect, checkRole("ADMIN"), serviceController.adminHide);

/**
 * @swagger
 * /api/services/{id}/unhide:
 *   patch:
 *     summary: Admin unhide a service (Admin only)
 *     tags: [Services]
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
 *         description: Service unhidden
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ServiceObject'
 */
serviceRouter.patch("/:id/unhide", protect, checkRole("ADMIN"), serviceController.adminUnhide);

export default serviceRouter;
