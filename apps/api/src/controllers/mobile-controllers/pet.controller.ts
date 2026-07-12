import { NextFunction, Request, Response } from "express";
import { mobilePetService } from "../../services/mobile-services/pet.service.ts";
import { responseSuccess } from "../../common/helpers/function.helper.ts";

export const mobilePetController = {
  async createPet(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobilePetService.createPet(req);
      const response = responseSuccess(result, "Pet created successfully", 201);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getMyPets(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobilePetService.getMyPets(req);
      const response = responseSuccess(result, "Pets retrieved successfully");
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getPetDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobilePetService.getPetDetail(req);
      const response = responseSuccess(
        result,
        "Pet detail retrieved successfully",
      );
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async updatePet(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mobilePetService.updatePet(req);
      const response = responseSuccess(result, "Pet updated successfully");
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async deletePet(req: Request, res: Response, next: NextFunction) {
    try {
      await mobilePetService.deletePet(req);
      const response = responseSuccess({}, "Pet deleted successfully");
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
