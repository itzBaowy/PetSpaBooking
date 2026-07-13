import { Request } from "express";
import prisma from "../../../connect.prisma.ts";
import { BadRequestException } from "../../common/helpers/exception.helper.ts";
import { ObjectId } from "mongodb";
import { getQueryString } from "../../common/helpers/paramHelper.ts";

export const mobileCustomerServices = {
  async editMyProfile(req: Request) {
    const userId = (req as Request & { user?: { userId: string } }).user
      ?.userId;

    if (!userId) {
      throw new BadRequestException("User id not found");
    }

    if (!ObjectId.isValid(userId)) {
      throw new BadRequestException("Invalid user ID format");
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    const { fullName, phone, location } = req.body;

    await prisma.customers.update({
      where: { userId: user.id },
      data: {
        users: {
          update: {
            fullName: fullName,
            phone: phone,
          },
        },
        location: location,
      },
    });
  },
};
