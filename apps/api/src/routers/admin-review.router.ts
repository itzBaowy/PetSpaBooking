import express from "express";
import { adminReviewController } from "../controllers/admin-review.controller.ts";
import { checkRole } from "../middlewares/authorization.middleware.ts";
import { protect } from "../middlewares/protect.middleware.ts";

const adminReviewRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin-Reviews
 *   description: Admin review moderation endpoints
 */

/**
 * @swagger
 * /api/admin/reviews:
 *   get:
 *     summary: List reviews for admin moderation
 *     tags: [Admin-Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: providerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: isHiddenByAdmin
 *         schema:
 *           type: boolean
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
 *         description: Admin reviews retrieved successfully
 */
adminReviewRouter.get(
  "/reviews",
  protect,
  checkRole("ADMIN"),
  adminReviewController.getAll,
);

/**
 * @swagger
 * /api/admin/reviews/{id}:
 *   get:
 *     summary: Get review detail for admin
 *     tags: [Admin-Reviews]
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
 *         description: Admin review retrieved successfully
 *       404:
 *         description: Review not found
 */
adminReviewRouter.get(
  "/reviews/:id",
  protect,
  checkRole("ADMIN"),
  adminReviewController.getById,
);

/**
 * @swagger
 * /api/admin/reviews/{id}/hide:
 *   patch:
 *     summary: Hide review from public provider rating/review lists
 *     tags: [Admin-Reviews]
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
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Review contains inappropriate language"
 *     responses:
 *       200:
 *         description: Review hidden successfully
 */
adminReviewRouter.patch(
  "/reviews/:id/hide",
  protect,
  checkRole("ADMIN"),
  adminReviewController.hide,
);

/**
 * @swagger
 * /api/admin/reviews/{id}/unhide:
 *   patch:
 *     summary: Restore review to public provider rating/review lists
 *     tags: [Admin-Reviews]
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
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Review was restored after moderation"
 *     responses:
 *       200:
 *         description: Review unhidden successfully
 */
adminReviewRouter.patch(
  "/reviews/:id/unhide",
  protect,
  checkRole("ADMIN"),
  adminReviewController.unhide,
);

export default adminReviewRouter;
