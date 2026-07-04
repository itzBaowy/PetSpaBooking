import { Request } from "express";
import prisma from "../../../connect.prisma.ts";
import { BadRequestException } from "../../common/helpers/exception.helper.ts";
import { getQueryString } from "../../common/helpers/paramHelper.ts";
import { ObjectId } from "mongodb";

export const mobilePetService = {
  async getMyPets(req: Request) {
    const userId = (req as Request & { user?: { userId: string } }).user
      ?.userId;

    if (!userId) {
      throw new BadRequestException("UserId not found");
    }

    if (!ObjectId.isValid(userId)) {
      throw new BadRequestException("Invalid user ID format");
    }

    const [pets, total] = await Promise.all([
      prisma.pets.findMany({
        where: { customers: { userId: userId } },
        select: {
          id: true,
          name: true,
          breed: true,
          ageLabel: true,
          imageUrl: true,
          status: true,
          nextVaccineDate: true,
        },
      }),

      prisma.pets.count({ where: { customers: { userId: userId } } }),
    ]);

    return { pets, total };
  },

  async getPetDetail(req: Request) {
    const { petId } = req.params;
    const _id = getQueryString(petId);

    if (!_id) {
      throw new BadRequestException("Pet ID is required");
    }

    if (!ObjectId.isValid(_id)) {
      throw new BadRequestException("Invalid pet ID format");
    }

    const pet = await prisma.pets.findUnique({
      where: { id: _id },
      select: {
        id: true,
        name: true,
        breed: true,
        gender: true,
        ageLabel: true,
        status: true,
        imageUrl: true,
        weight: true,
        height: true,
        color: true,
        criticalNote: true,
        healthReminder: true,
        medicalRecords: true,
        photos: true,
      },
    });

    if (!pet) {
      throw new BadRequestException("Pet not found");
    }

    return pet;
  },
};
