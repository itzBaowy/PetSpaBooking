import { Request, Response, NextFunction } from "express";
import { responseSuccess } from "../common/helpers/function.helper.ts";
import { providerService } from "../services/provider.service.ts";

export const providerController = {
    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await providerService.register(req);
            const response = responseSuccess(result, "Provider application submitted successfully", 201);
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },

    async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await providerService.getMe(req);
            const response = responseSuccess(result, "Provider profile retrieved successfully");
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },

    async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await providerService.updateMe(req);
            const response = responseSuccess(result, "Provider profile updated successfully");
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },

    async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await providerService.uploadDocument(req);
            const response = responseSuccess(result, "Document uploaded successfully", 201);
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },

    async getMyDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await providerService.getMyDocuments(req);
            const response = responseSuccess(result, "Documents retrieved successfully");
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },

    async deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await providerService.deleteDocument(req);
            const response = responseSuccess(result, "Document deleted successfully");
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await providerService.getAll(req);
            const response = responseSuccess(result, "Providers retrieved successfully");
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await providerService.getById(req);
            const response = responseSuccess(result, "Provider retrieved successfully");
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },

    async approve(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await providerService.approve(req);
            const response = responseSuccess(result, "Provider approved successfully");
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },

    async reject(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await providerService.reject(req);
            const response = responseSuccess(result, "Provider rejected");
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },

    async suspend(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await providerService.suspend(req);
            const response = responseSuccess(result, "Provider suspended successfully");
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },
};
