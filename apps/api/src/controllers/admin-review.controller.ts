import { NextFunction, Request, Response } from "express";
import { responseSuccess } from "../common/helpers/function.helper.ts";
import { adminReviewService } from "../services/admin-review.service.ts";

export const adminReviewController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminReviewService.getAll(req);
      const response = responseSuccess(
        result,
        "Admin reviews retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminReviewService.getById(req);
      const response = responseSuccess(
        result,
        "Admin review retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async hide(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminReviewService.hide(req);
      const response = responseSuccess(
        result,
        "Review hidden successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async unhide(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminReviewService.unhide(req);
      const response = responseSuccess(
        result,
        "Review unhidden successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
