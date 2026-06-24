import { Request, Response, NextFunction } from "express";
import { responseSuccess } from "../common/helpers/function.helper.ts";
import { authService } from "../services/auth.service.ts";

export const authController = {
    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await authService.register(req);
            const response = responseSuccess(result, `Register successfully!`);
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    },

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await authService.login(req);
            const response = responseSuccess(result, `Login successfully`);
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    },

    async getInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await authService.getInfo(req);
            const response = responseSuccess(result, `Get user info successfully`);
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    },
};
