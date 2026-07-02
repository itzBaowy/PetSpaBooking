import { Request, Response, NextFunction } from "express";
import { responseSuccess } from "../../common/helpers/function.helper.ts";
import { mobileServiceServices } from "../../services/mobile-services/service.service.ts";

export const mobileServiceController = {
  async getAllServiceByProviderId(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await mobileServiceServices.getAllServiceByProviderId(
        req,
        res,
      );
      const response = responseSuccess(
        result,
        "Services retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getServiceDetailById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await mobileServiceServices.getDetailServiceById(req);
      console.log(result);
      const response = responseSuccess(
        result,
        "Service detail retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
