import { Router } from "express";
import { mobilePetController } from "../../controllers/mobile-controllers/pet.controller.ts";
import { checkRole } from "../../middlewares/authorization.middleware.ts";
import { protect } from "../../middlewares/protect.middleware.ts";
import { uploadMemory } from "../../common/multer/memory.multer.ts";

export const mobilePetRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Mobile-Pet
 *   description: Pet management endpoints for mobile customers
 */

/**
 * @swagger
 * /api/mobile/pets:
 *   post:
 *     summary: Create a new pet profile
 *     tags: [Mobile-Pet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/PetCreateRequest'
 *     responses:
 *       201:
 *         description: Pet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PetResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
mobilePetRouter.post(
  "/pets",
  protect,
  checkRole("CUSTOMER"),
  uploadMemory.single("imageUrl"),
  mobilePetController.createPet,
);

/**
 * @swagger
 * /api/mobile/pets/my-pets:
 *   get:
 *     summary: Get list of pets belonging to current customer
 *     tags: [Mobile-Pet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *           example: '{"status":"ACTIVE"}'
 *     responses:
 *       200:
 *         description: Successfully retrieved pets list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PetListResponse'
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
 *               $ref: '#/components/schemas/PetResponse'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
mobilePetRouter.get(
  "/pets/pet-detail/:petId",
  protect,
  checkRole("CUSTOMER"),
  mobilePetController.getPetDetail,
);

/**
 * @swagger
 * /api/mobile/pets/{petId}:
 *   patch:
 *     summary: Update pet profile
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
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/PetUpdateRequest'
 *     responses:
 *       200:
 *         description: Pet updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PetResponse'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
mobilePetRouter.patch(
  "/pets/:petId",
  protect,
  checkRole("CUSTOMER"),
  uploadMemory.single("imageUrl"),
  mobilePetController.updatePet,
);

/**
 * @swagger
 * /api/mobile/pets/{petId}:
 *   delete:
 *     summary: Delete a pet profile
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
 *         description: Pet deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
mobilePetRouter.delete(
  "/pets/:petId",
  protect,
  checkRole("CUSTOMER"),
  mobilePetController.deletePet,
);

export default mobilePetRouter;
