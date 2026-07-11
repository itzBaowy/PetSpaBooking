import { NextFunction, Request, Response } from "express";
import { responseSuccess } from "../common/helpers/function.helper.ts";
import { adminBookingService } from "../services/admin-booking.service.ts";

export const adminBookingController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminBookingService.getAll(req);
      const response = responseSuccess(
        result,
        "Admin bookings retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminBookingService.getById(req);
      const response = responseSuccess(
        result,
        "Admin booking retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
