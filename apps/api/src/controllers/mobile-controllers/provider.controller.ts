import { Request, Response, NextFunction } from "express";
import { responseSuccess } from "../../common/helpers/function.helper.ts";
import { mobileProviderServices } from "../../services/mobile-services/provider.service.ts";

export const mobileProviderController = {
  async getAllProviders(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await mobileProviderServices.getAllProviders(req);
      const response = responseSuccess(
        result,
        "Providers retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getAllReviewByProviderId(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await mobileProviderServices.getReviewsByProviderId(req);
      const response = responseSuccess(
        result,
        "Reviews retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getProviderInfomation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await mobileProviderServices.getProviderInfomation(req);
      const response = responseSuccess(
        result,
        "Provider information retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getWallet(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await mobileProviderServices.getWallet(req);
      const response = responseSuccess(
        result,
        "Provider wallet retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getWalletTransactions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await mobileProviderServices.getWalletTransactions(req);
      const response = responseSuccess(
        result,
        "Provider wallet transactions retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
