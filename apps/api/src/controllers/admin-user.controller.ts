import { NextFunction, Request, Response } from "express";
import { responseSuccess } from "../common/helpers/function.helper.ts";
import { adminUserService } from "../services/admin-user.service.ts";

export const adminUserController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminUserService.getAll(req);
      const response = responseSuccess(result, "Admin users retrieved successfully");
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminUserService.getById(req);
      const response = responseSuccess(result, "Admin user retrieved successfully");
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminUserService.updateStatus(req);
      const response = responseSuccess(
        result,
        "User status updated successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
