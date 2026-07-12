import { NextFunction, Request, Response } from "express";
import { responseSuccess } from "../common/helpers/function.helper.ts";
import { adminFinanceService } from "../services/admin-finance.service.ts";

export const adminFinanceController = {
  async getWalletTransactions(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await adminFinanceService.getWalletTransactions(req);
      const response = responseSuccess(
        result,
        "Wallet transactions retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getProviderWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminFinanceService.getProviderWallet(req);
      const response = responseSuccess(
        result,
        "Provider wallet audit retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getBookingFinance(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminFinanceService.getBookingFinance(req);
      const response = responseSuccess(
        result,
        "Booking finance audit retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getRefunds(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminFinanceService.getRefunds(req);
      const response = responseSuccess(
        result,
        "Refund requests retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getRefundByBookingId(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await adminFinanceService.getRefundByBookingId(req);
      const response = responseSuccess(
        result,
        "Refund request retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async markRefunded(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminFinanceService.markRefunded(req);
      const response = responseSuccess(
        result,
        "Refund marked as completed successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async rejectRefund(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminFinanceService.rejectRefund(req);
      const response = responseSuccess(
        result,
        "Refund rejected successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async adjustProviderWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminFinanceService.adjustProviderWallet(req);
      const response = responseSuccess(
        result,
        "Provider wallet adjusted successfully",
        201,
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
