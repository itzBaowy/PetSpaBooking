import { NextFunction, Request, Response } from "express";
import { responseSuccess } from "../../common/helpers/function.helper.ts";
import { mobileBookingServices } from "../../services/mobile-services/booking.service.ts";
import { momoPaymentService } from "../../services/mobile-services/momo-payment.service.ts";

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

  async cancelMyBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobileBookingServices.cancelMyBooking(req);
      const response = responseSuccess(
        result,
        "Booking cancelled successfully",
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

  async cancelProviderBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobileBookingServices.cancelProviderBooking(req);
      const response = responseSuccess(
        result,
        "Booking cancelled successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async markNoArrival(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobileBookingServices.markNoArrival(req);
      const response = responseSuccess(
        result,
        "Booking marked as no-arrival successfully",
      );
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

  async createMomoPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await momoPaymentService.createPayment(req);
      const response = responseSuccess(
        result,
        "MoMo payment created successfully",
        201,
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async handleMomoIpn(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await momoPaymentService.handleIpn(req);
      const response = responseSuccess(
        result,
        "MoMo IPN processed successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async handleMomoReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await momoPaymentService.handleReturn(req);
      const response = responseSuccess(
        result,
        "MoMo return processed successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async createProviderDepositMomoPayment(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await momoPaymentService.createProviderDepositPayment(req);
      const response = responseSuccess(
        result,
        "Provider deposit MoMo payment created successfully",
        201,
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async syncProviderDepositMomoPayment(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await momoPaymentService.syncProviderDepositPayment(req);
      const response = responseSuccess(
        result,
        "Provider deposit MoMo payment synced successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async handleProviderDepositMomoIpn(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await momoPaymentService.handleProviderDepositIpn(req);
      const response = responseSuccess(
        result,
        "Provider deposit MoMo IPN processed successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async handleProviderDepositMomoReturn(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await momoPaymentService.handleProviderDepositReturn(req);
      const response = responseSuccess(
        result,
        "Provider deposit MoMo return processed successfully",
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
