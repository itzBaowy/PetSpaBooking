import { NextFunction, Request, Response } from "express";
import { mobileCustomerServices } from "../../services/mobile-services/customer.service.ts";
import { responseSuccess } from "../../common/helpers/function.helper.ts";

export const mobileCustomerController = {
  async editMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      await mobileCustomerServices.editMyProfile(req);
      const response = responseSuccess({}, "Profile updated successfully");
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
