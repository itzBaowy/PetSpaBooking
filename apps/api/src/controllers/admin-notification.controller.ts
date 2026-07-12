import { NextFunction, Request, Response } from "express";
import { responseSuccess } from "../common/helpers/function.helper.ts";
import { adminNotificationService } from "../services/admin-notification.service.ts";

export const adminNotificationController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminNotificationService.getAll(req);
      const response = responseSuccess(
        result,
        "Admin notifications retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async send(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminNotificationService.send(req);
      const response = responseSuccess(
        result,
        "Notification sent successfully",
        201,
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async broadcast(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminNotificationService.broadcast(req);
      const response = responseSuccess(
        result,
        "Notification broadcast successfully",
        201,
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
