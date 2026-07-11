import { NextFunction, Request, Response } from "express";
import { responseSuccess } from "../../common/helpers/function.helper.ts";
import { mobileBookingServices } from "../../services/mobile-services/booking.service.ts";

export const mobileBookingController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobileBookingServices.create(req);
      const response = responseSuccess(
        result,
        "Booking created successfully",
        201,
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getMyBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobileBookingServices.getMyBookings(req);
      const response = responseSuccess(
        result,
        "Bookings retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getMyBookingById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobileBookingServices.getMyBookingById(req);
      const response = responseSuccess(
        result,
        "Booking retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getMyBookingQr(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobileBookingServices.getMyBookingQr(req);
      const response = responseSuccess(
        result,
        "Booking QR token generated successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async createDispute(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobileBookingServices.createDispute(req);
      const response = responseSuccess(
        result,
        "Booking dispute created successfully",
        201,
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobileBookingServices.createReview(req);
      const response = responseSuccess(
        result,
        "Booking review created successfully",
        201,
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getProviderBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobileBookingServices.getProviderBookings(req);
      const response = responseSuccess(
        result,
        "Provider bookings retrieved successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobileBookingServices.confirm(req);
      const response = responseSuccess(
        result,
        "Booking confirmed successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobileBookingServices.reject(req);
      const response = responseSuccess(result, "Booking rejected successfully");
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobileBookingServices.checkIn(req);
      const response = responseSuccess(
        result,
        "Booking checked in successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobileBookingServices.checkOut(req);
      const response = responseSuccess(
        result,
        "Booking checked out successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
