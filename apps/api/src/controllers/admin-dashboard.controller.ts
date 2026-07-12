import { NextFunction, Request, Response } from "express";
import { responseSuccess } from "../common/helpers/function.helper.ts";
import { adminDashboardService } from "../services/admin-dashboard.service.ts";

export const adminDashboardController = {
  async getSummary(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminDashboardService.getSummary();
      const response = responseSuccess(
        result,
        "Admin dashboard summary retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
