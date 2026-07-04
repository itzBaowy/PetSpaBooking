import { Router } from "express";
import { protect } from "../../middlewares/protect.middleware.ts";
import { checkRole } from "../../middlewares/authorization.middleware.ts";
import { mobilePetController } from "../../controllers/mobile-controllers/pet.controller.ts";

export const mobilePetRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Mobile-Pet
 *   description: Pets endpoint only use for Mobile
 */

/**
 * @swagger
 * /api/mobile/pets/my-pets:
 *   get:
 *     summary: Get all pets for the logged-in customer
 *     tags: [Mobile-Pet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved list of pets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Pets retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "67a4b123e4d5c6f789012345"
 *                           name:
 *                             type: string
 *                             example: "Buddy"
 *                           breed:
 *                             type: string
 *                             example: "Golden Retriever"
 *                           ageLabel:
 *                             type: string
 *                             example: "Adult"
 *                           imageUrl:
 *                             type: string
 *                             example: "https://example.com/buddy.jpg"
 *                           status:
 *                             type: string
 *                             example: "ACTIVE"
 *                           nextVaccineDate:
 *                             type: string
 *                             format: date
 *                             nullable: true
 *                             example: "2025-12-31"
 *                     page:
 *                       type: number
 *                       example: 1
 *                     pageSize:
 *                       type: number
 *                       example: 10
 *                     total:
 *                       type: number
 *                       example: 3
 */
mobilePetRouter.get(
  "/pets/my-pets",
  protect,
  checkRole("CUSTOMER"),
  mobilePetController.getMyPets,
);

/**
 * @swagger
 * /api/mobile/pets/pet-detail/{petId}:
 *   get:
 *     summary: Get pet detail for mobile
 *     tags: [Mobile-Pet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *         description: Pet ID
 *     responses:
 *       200:
 *         description: Successfully retrieved pet detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Pet detail retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "67a4b123e4d5c6f789012345"
 *                     name:
 *                       type: string
 *                       example: "Buddy"
 *                     breed:
 *                       type: string
 *                       example: "Golden Retriever"
 *                     gender:
 *                       type: string
 *                       example: "Male"
 *                     ageLabel:
 *                       type: string
 *                       example: "Adult"
 *                     status:
 *                       type: string
 *                       example: "ACTIVE"
 *                     imageUrl:
 *                       type: string
 *                       example: "https://example.com/buddy.jpg"
 *                     weight:
 *                       type: string
 *                       example: "30kg"
 *                     height:
 *                       type: string
 *                       example: "60cm"
 *                     color:
 *                       type: string
 *                       example: "Golden"
 *                     criticalNote:
 *                       type: string
 *                       nullable: true
 *                       example: "Allergic to chicken"
 *                     healthReminder:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         frequency:
 *                           type: string
 *                           enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]
 *                           example: "MONTHLY"
 *                         nextReminderDate:
 *                           type: string
 *                           format: date
 *                           example: "2025-12-31"
 *                     medicalRecords:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           recordId:
 *                             type: string
 *                             example: ""
 *                           recordType:
 *                             type: string
 *                             enum: ["VACCINATION", "TREATMENT", "CHECKUP"]
 *                             example: "VACCINATION"
 *                           recordDate:
 *                             type: string
 *                             format: date
 *                             example: "2024-01-15"
 *                           veterinarian:
 *                             type: string
 *                             example: "Dr. Smith"
 *                           reason:
 *                             type: string
 *                             example: "Annual vaccination"
 *                           notes:
 *                             type: string
 *                             example: "Received Distemper/Parvo combo vaccine"
 *                           attachments:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["https://example.com/record1.pdf"]
 *                     photos:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["https://example.com/buddy1.jpg", "https://example.com/buddy2.jpg"]
 */
mobilePetRouter.get(
  "/pets/pet-detail/:petId",
  protect,
  checkRole("CUSTOMER"),
  mobilePetController.getPetDetail,
);

export default mobilePetRouter;
