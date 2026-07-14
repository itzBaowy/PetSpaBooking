import { Request, Response, NextFunction } from "express";
import { userMobileService } from "../../services/mobile-services/user-mobile.service.ts";
import { responseSuccess } from "../../common/helpers/function.helper.ts";

export const saveDeviceToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { token } = req.body;

    const data = await userMobileService.saveDeviceToken(userId, token);

    const response = responseSuccess(data, "Device token saved successfully");
    res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

export const removeDeviceToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    const data = await userMobileService.removeDeviceToken(userId);

    const response = responseSuccess(data, "Device token removed successfully");
    res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
};
