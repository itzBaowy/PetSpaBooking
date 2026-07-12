import express from "express";
import { userController } from "../controllers/user.controller.ts";
import { protect } from "../middlewares/protect.middleware.ts";
import { checkRole } from "../middlewares/authorization.middleware.ts";
import { uploadMemory } from "../common/multer/memory.multer.ts";

const userRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints (Admin & self-service)
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
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
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page (min 10)
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *         description: 'JSON string filter, e.g: {"userName":"john","status":"ACTIVE"}'
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         description: Filter by status (whitelist validated)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [CUSTOMER, ADMIN, PROVIDER]
 *         description: Filter by role (whitelist validated)
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserListResponse'
 *             example:
 *               status: success
 *               statusCode: 200
 *               message: Users retrieved successfully
 *               data:
 *                 page: 1
 *                 pageSize: 10
 *                 totalItem: 50
 *                 totalPage: 5
 *                 items:
 *                   - id: 507f1f77bcf86cd799439011
 *                     userName: johndoe
 *                     email: john@example.com
 *                     phone: "0901234567"
 *                     fullName: John Doe
 *                     avatar: null
 *                     role: CUSTOMER
 *                     status: ACTIVE
 *                     createAt: "2026-01-01T00:00:00.000Z"
 *                     updateAt: "2026-01-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden – Admins only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.get("/", protect, checkRole("ADMIN"), userController.getAll);

/**
 * @swagger
 * /api/users/me/password:
 *   patch:
 *     summary: Change my password
 *     description: Authenticated user changes their own password by providing the current password.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "Test@123"
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: "NewTest@123"
 *               confirmPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: "NewTest@123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Missing fields, weak password, or password confirmation mismatch
 *       401:
 *         description: Unauthorized or current password is incorrect
 */
userRouter.patch("/me/password", protect, userController.changePassword);


/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID (Admin or the user themselves)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserObject'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.get("/:id", protect, userController.getById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserObject'
 *       400:
 *         description: Validation error or duplicate field
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
 *       403:
 *         description: Forbidden – Admins only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.post("/", protect, checkRole("ADMIN"), userController.create);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user (Admin — full access | User — profile fields only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserObject'
 *       400:
 *         description: Validation error
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
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.put("/:id", protect, userController.update);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Deactivate a user by ID — soft delete (Admin only)
 *     description: Does not permanently delete the user. Sets the user's status to `INACTIVE`.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserObject'
 *             example:
 *               status: success
 *               statusCode: 200
 *               message: User deactivated successfully
 *               data:
 *                 id: 507f1f77bcf86cd799439011
 *                 userName: johndoe
 *                 status: INACTIVE
 *       400:
 *         description: User is already inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               statusCode: 400
 *               message: User is already inactive
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden – Admins only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.delete("/:id", protect, checkRole("ADMIN"), userController.remove);

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Update a user's role (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRoleRequest'
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserObject'
 *             example:
 *               status: success
 *               statusCode: 200
 *               message: User role updated successfully
 *               data:
 *                 id: 507f1f77bcf86cd799439011
 *                 userName: johndoe
 *                 role: PROVIDER
 *                 status: ACTIVE
 *       400:
 *         description: Invalid role value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               statusCode: 400
 *               message: "Invalid role. Allowed: CUSTOMER, ADMIN, PROVIDER"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden – Admins only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.patch("/:id/role", protect, checkRole("ADMIN"), userController.updateRole);

/**
 * @swagger
 * /api/users/avatar-cloud:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file to upload
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserObject'
 *       400:
 *         description: Bad request (e.g., no file uploaded or invalid format)
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.post("/avatar-cloud", protect, uploadMemory.single("avatar"), userController.uploadAvatar);
export default userRouter;
