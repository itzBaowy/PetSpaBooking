import { Router } from "express";
import { mobileCustomerController } from "../../controllers/mobile-controllers/customer.controller.ts";
import { protect } from "../../middlewares/protect.middleware.ts";
import { checkRole } from "../../middlewares/authorization.middleware.ts";
import { uploadMemory } from "../../common/multer/memory.multer.ts";

const mobileCustomerRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Mobile-Customer
 *   description: Pets endpoint only use for Mobile
 */

/**
 * @swagger
 * /api/mobile/customer/edit-profile:
 *   patch:
 *     summary: Edit my profile
 *     tags: [Mobile-Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Nguyen Van A"
 *               phone:
 *                 type: string
 *                 example: "0123456789"
 *               location:
 *                 type: string
 *                 example: "123 Main St, Anytown, USA"
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file to upload
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 data:
 *                   type: object
 *                   example: {}
 */
mobileCustomerRouter.patch(
  "/customer/edit-profile",
  protect,
  checkRole("CUSTOMER"),
  uploadMemory.single("avatar"),
  mobileCustomerController.editMyProfile,
);

/**
 * @swagger
 * /api/mobile/customer/disputes:
 *   get:
 *     summary: Get customer disputes
 *     description: Customer retrieves their own disputes.
 *     tags: [Mobile-Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Customer disputes retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer role required
 */
mobileCustomerRouter.get(
  "/customer/disputes",
  protect,
  checkRole("CUSTOMER"),
  mobileCustomerController.getDisputes,
);

/**
 * @swagger
 * /api/mobile/customer/disputes/{id}:
 *   get:
 *     summary: Get customer dispute detail
 *     description: Customer retrieves a dispute detail, including provider and admin responses.
 *     tags: [Mobile-Customer]
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
 *         description: Customer dispute retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer role required
 *       404:
 *         description: Dispute not found
 */
mobileCustomerRouter.get(
  "/customer/disputes/:id",
  protect,
  checkRole("CUSTOMER"),
  mobileCustomerController.getDisputeById,
);

export default mobileCustomerRouter;
