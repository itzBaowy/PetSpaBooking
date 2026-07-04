import { Router } from "express";
import { mobileCustomerController } from "../../controllers/mobile-controllers/customer.controller.ts";
import { protect } from "../../middlewares/protect.middleware.ts";
import { checkRole } from "../../middlewares/authorization.middleware.ts";

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
 *         application/json:
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
  mobileCustomerController.editMyProfile,
);

export default mobileCustomerRouter;
