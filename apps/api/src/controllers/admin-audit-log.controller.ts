import { NextFunction, Request, Response } from "express";
import { responseSuccess } from "../common/helpers/function.helper.ts";
import { adminAuditLogService } from "../services/admin-audit-log.service.ts";

export const adminAuditLogController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminAuditLogService.getAll(req);
      const response = responseSuccess(
        result,
        "Admin audit logs retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
