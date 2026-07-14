import { Request, Response, NextFunction } from "express";
import { responseSuccess } from "../../common/helpers/function.helper.ts";
import { mobileProviderServices } from "../../services/mobile-services/provider.service.ts";
import { mobileAvailabilityService } from "../../services/mobile-services/availability.service.ts";

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

  async searchGlobal(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await mobileProviderServices.searchGlobal(req);
      const response = responseSuccess(
        result,
        "Global search results retrieved successfully",
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

  async getDisputes(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await mobileProviderServices.getDisputes(req);
      const response = responseSuccess(
        result,
        "Provider disputes retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getDisputeById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await mobileProviderServices.getDisputeById(req);
      const response = responseSuccess(
        result,
        "Provider dispute retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async respondDispute(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await mobileProviderServices.respondDispute(req);
      const response = responseSuccess(
        result,
        "Provider dispute response submitted successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async createWithdrawal(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await mobileProviderServices.createWithdrawal(req);
      const response = responseSuccess(
        result,
        "Withdrawal request created successfully",
        201,
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getWithdrawals(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await mobileProviderServices.getWithdrawals(req);
      const response = responseSuccess(
        result,
        "Provider withdrawals retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getWorkingHours(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await mobileAvailabilityService.getWorkingHours(req);
      const response = responseSuccess(
        result,
        "Provider working hours retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async updateWorkingHours(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await mobileAvailabilityService.updateWorkingHours(req);
      const response = responseSuccess(
        result,
        "Provider working hours updated successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getAvailabilityBlocks(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await mobileAvailabilityService.getBlocks(req);
      const response = responseSuccess(
        result,
        "Provider availability blocks retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async createAvailabilityBlock(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await mobileAvailabilityService.createBlock(req);
      const response = responseSuccess(
        result,
        "Provider availability block created successfully",
        201,
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async deleteAvailabilityBlock(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await mobileAvailabilityService.deleteBlock(req);
      const response = responseSuccess(
        result,
        "Provider availability block deleted successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getAvailableSlots(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await mobileAvailabilityService.getAvailableSlots(req);
      const response = responseSuccess(
        result,
        "Provider available slots retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
