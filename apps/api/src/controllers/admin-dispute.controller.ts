import { NextFunction, Request, Response } from "express";
import { responseSuccess } from "../common/helpers/function.helper.ts";
import { adminDisputeService } from "../services/admin-dispute.service.ts";

export const adminDisputeController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminDisputeService.getAll(req);
      const response = responseSuccess(
        result,
        "Disputes retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminDisputeService.getById(req);
      const response = responseSuccess(
        result,
        "Dispute retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async resolve(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminDisputeService.resolve(req);
      const response = responseSuccess(
        result,
        "Dispute resolved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
