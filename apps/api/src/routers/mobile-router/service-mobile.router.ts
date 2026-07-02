import express from "express";
import { mobileServiceController } from "../../controllers/mobile-controllers/service.controller.ts";
import { protect } from "../../middlewares/protect.middleware.ts";
import { checkRole } from "../../middlewares/authorization.middleware.ts";
const mobileServiceRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Mobile-Services
 *   description: Services endpoint only use for Mobile
 */

/**
 * @swagger
 * /api/mobile/services/{providerId}:
 *   get:
 *     summary: Get service by provider ID for mobile
 *     description: Retrieve all active services of a provider. User only need to provide provider ID to get the services.
 *     tags: [Mobile-Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Provider ID
 *     responses:
 *       200:
 *         description: List of services for mobile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MobileServiceListResponse'
 */
mobileServiceRouter.get(
  "/services/:providerId",
  protect,
  checkRole("CUSTOMER"),
  mobileServiceController.getAllServiceByProviderId,
);

/**
 * @swagger
 * /api/mobile/services/service-detail/{serviceId}:
 *   get:
 *     summary: Get service detail by service ID for mobile
 *     description: Retrieve the detail of a service.
 *     tags: [Mobile-Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service detail for mobile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceDetailResponse'
 */
mobileServiceRouter.get(
  "/services/service-detail/:serviceId",
  protect,
  checkRole("CUSTOMER"),
  mobileServiceController.getServiceDetailById,
);

export default mobileServiceRouter;
