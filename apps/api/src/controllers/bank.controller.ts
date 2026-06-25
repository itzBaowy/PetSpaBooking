import { Request, Response, NextFunction } from "express";
import { responseSuccess } from "../common/helpers/function.helper.ts";
import { bankService } from "../services/bank.service.ts";

export const bankController = {
    async getBanks(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await bankService.getBanks();
            const response = responseSuccess(result, "Get bank list successfully");
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    },
};
