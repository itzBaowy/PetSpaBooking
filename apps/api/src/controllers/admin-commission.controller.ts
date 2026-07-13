import { NextFunction, Request, Response } from "express";
import { responseSuccess } from "../common/helpers/function.helper.ts";
import { commissionRecordService } from "../services/commission-record.service.ts";

export const adminCommissionController = {
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await commissionRecordService.getSummary();
      const response = responseSuccess(
        result,
        "Commission summary retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await commissionRecordService.getAll(req);
      const response = responseSuccess(
        result,
        "Commission records retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getPending(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await commissionRecordService.getPending(req);
      const response = responseSuccess(
        result,
        "Pending commission records retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await commissionRecordService.getById(req);
      const response = responseSuccess(
        result,
        "Commission record retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
