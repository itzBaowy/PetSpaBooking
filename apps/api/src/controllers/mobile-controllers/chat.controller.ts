import { NextFunction, Request, Response } from "express";
import { responseSuccess } from "../../common/helpers/function.helper.ts";
import { mobileChatService } from "../../services/mobile-services/chat.service.ts";

export const mobileChatController = {
  async getOrCreateBookingThread(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await mobileChatService.getOrCreateBookingThread(req);
      const response = responseSuccess(
        result,
        "Chat thread retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getMyThreads(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobileChatService.getMyThreads(req);
      const response = responseSuccess(
        result,
        "Chat threads retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobileChatService.getMessages(req);
      const response = responseSuccess(
        result,
        "Chat messages retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobileChatService.sendMessage(req);
      const response = responseSuccess(
        result,
        "Chat message sent successfully",
        201,
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobileChatService.markRead(req);
      const response = responseSuccess(
        result,
        "Chat thread marked as read successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
