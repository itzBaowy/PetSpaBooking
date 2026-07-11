import { NextFunction, Request, Response } from "express";
import { responseSuccess } from "../common/helpers/function.helper.ts";
import { adminWithdrawalService } from "../services/admin-withdrawal.service.ts";

export const adminWithdrawalController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminWithdrawalService.getAll(req);
      const response = responseSuccess(
        result,
        "Withdrawal requests retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminWithdrawalService.getById(req);
      const response = responseSuccess(
        result,
        "Withdrawal request retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminWithdrawalService.approve(req);
      const response = responseSuccess(
        result,
        "Withdrawal request approved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminWithdrawalService.reject(req);
      const response = responseSuccess(
        result,
        "Withdrawal request rejected successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async markPaid(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminWithdrawalService.markPaid(req);
      const response = responseSuccess(
        result,
        "Withdrawal request marked as paid successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
