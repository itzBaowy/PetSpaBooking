import { NextFunction, Request, Response } from "express";
import { responseSuccess } from "../../common/helpers/function.helper.ts";
import { notificationService } from "../../services/notification.service.ts";

export const mobileNotificationController = {
  async getMine(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.getMine(req);
      const response = responseSuccess(
        result,
        "Notifications retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.markRead(req);
      const response = responseSuccess(
        result,
        "Notification marked as read successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.markAllRead(req);
      const response = responseSuccess(
        result,
        "Notifications marked as read successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
