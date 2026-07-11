import { NextFunction, Request, Response } from "express";
import { responseSuccess } from "../common/helpers/function.helper.ts";
import { adminReportService } from "../services/admin-report.service.ts";

export const adminReportController = {
  async getRevenueSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminReportService.getRevenueSummary(req);
      const response = responseSuccess(
        result,
        "Revenue summary retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getDailyRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminReportService.getDailyRevenue(req);
      const response = responseSuccess(
        result,
        "Daily revenue retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getProviderPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminReportService.getProviderPerformance(req);
      const response = responseSuccess(
        result,
        "Provider performance report retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getDisputeReport(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminReportService.getDisputeReport(req);
      const response = responseSuccess(
        result,
        "Dispute report retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
