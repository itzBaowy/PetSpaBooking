import { NextFunction, Request, Response } from "express";
import { responseSuccess } from "../common/helpers/function.helper.ts";
import { providerService } from "../services/provider.service.ts";
import { adminProviderService } from "../services/admin-provider.service.ts";

export const adminProviderController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await providerService.getAll(req);
      const response = responseSuccess(
        result,
        "Admin providers retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getPending(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminProviderService.getPending(req);
      const response = responseSuccess(
        result,
        "Pending providers retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await providerService.getById(req);
      const response = responseSuccess(
        result,
        "Admin provider retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await providerService.approve(req);
      const response = responseSuccess(
        result,
        "Provider verified successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await providerService.reject(req);
      const response = responseSuccess(
        result,
        "Provider rejected successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async suspend(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await providerService.suspend(req);
      const response = responseSuccess(
        result,
        "Provider suspended successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
