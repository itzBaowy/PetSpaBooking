import { NextFunction, Request, Response } from "express";
import { responseSuccess } from "../common/helpers/function.helper.ts";
import { adminChatService } from "../services/admin-chat.service.ts";

export const adminChatController = {
  async getOrCreateBookingThread(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await adminChatService.getOrCreateBookingThread(req);
      const response = responseSuccess(
        result,
        "Admin chat thread retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminChatService.getAll(req);
      const response = responseSuccess(
        result,
        "Admin chat threads retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminChatService.getMessages(req);
      const response = responseSuccess(
        result,
        "Admin chat messages retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminChatService.sendMessage(req);
      const response = responseSuccess(
        result,
        "Admin chat message sent successfully",
        201,
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminChatService.markRead(req);
      const response = responseSuccess(
        result,
        "Admin chat thread marked as read successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
