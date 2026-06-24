import { Request, Response, NextFunction } from "express";
import { responseSuccess } from "../common/helpers/function.helper.ts";
import { userService } from "../services/user.service.ts";

export const userController = {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await userService.getAll(req);
            const response = responseSuccess(result, "Users retrieved successfully");
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    },

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await userService.getById(req);
            const response = responseSuccess(result, "User retrieved successfully");
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    },

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await userService.create(req);
            const response = responseSuccess(result, "User created successfully", 201);
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    },

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await userService.update(req);
            const response = responseSuccess(result, "User updated successfully");
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    },

    async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await userService.remove(req);
            const response = responseSuccess(result, "User deactivated successfully");
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    },

    async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await userService.updateRole(req);
            const response = responseSuccess(result, "User role updated successfully");
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    },
};
