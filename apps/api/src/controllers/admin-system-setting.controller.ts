import { NextFunction, Request, Response } from "express";
import { responseSuccess } from "../common/helpers/function.helper.ts";
import { adminSystemSettingService } from "../services/system-setting.service.ts";

export const adminSystemSettingController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminSystemSettingService.getAll();
      const response = responseSuccess(
        result,
        "System settings retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminSystemSettingService.update(req);
      const response = responseSuccess(
        result,
        "System settings updated successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
