import { Request } from "express";
import prisma from "../../../connect.prisma.ts";
import { BadRequestException } from "../../common/helpers/exception.helper.ts";

export const mobileCustomerServices = {
  async editMyProfile(req: Request) {
    const userId = (req as Request & { user?: { userId: string } }).user
      ?.userId;

    if (!userId) {
      throw new BadRequestException("User id not found");
    }
  },
};
