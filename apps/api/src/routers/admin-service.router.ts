import express from "express";
import { serviceController } from "../controllers/service.controller.ts";
import { protect } from "../middlewares/protect.middleware.ts";
import { checkRole } from "../middlewares/authorization.middleware.ts";

const adminServiceRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin-Services
 *   description: Admin service catalog moderation endpoints
 */

/**
 * @swagger
 * /api/admin/services:
 *   get:
 *     summary: List services for admin
 *     description: Admin lists provider services with moderation filters.
 *     tags: [Admin-Services]
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
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Services retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 */
adminServiceRouter.get(
  "/services",
  protect,
  checkRole("ADMIN"),
  serviceController.getAll,
);

/**
 * @swagger
 * /api/admin/services/{id}:
 *   get:
 *     summary: Get service detail for admin
 *     description: Admin retrieves one provider service with provider summary.
 *     tags: [Admin-Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service retrieved successfully
 *       404:
 *         description: Service not found
 */
adminServiceRouter.get(
  "/services/:id",
  protect,
  checkRole("ADMIN"),
  serviceController.getById,
);

/**
 * @swagger
 * /api/admin/services/{id}/hide:
 *   patch:
 *     summary: Hide a service
 *     description: Admin hides a provider service from customer/mobile booking surfaces.
 *     tags: [Admin-Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Service violates platform policy
 *     responses:
 *       200:
 *         description: Service hidden by admin
 *       400:
 *         description: Service is already hidden
 *       404:
 *         description: Service not found
 */
adminServiceRouter.patch(
  "/services/:id/hide",
  protect,
  checkRole("ADMIN"),
  serviceController.adminHide,
);

/**
 * @swagger
 * /api/admin/services/{id}/unhide:
 *   patch:
 *     summary: Unhide a service
 *     description: Admin makes a hidden service visible again.
 *     tags: [Admin-Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service unhidden by admin
 *       400:
 *         description: Service is not hidden
 *       404:
 *         description: Service not found
 */
adminServiceRouter.patch(
  "/services/:id/unhide",
  protect,
  checkRole("ADMIN"),
  serviceController.adminUnhide,
);

export default adminServiceRouter;
