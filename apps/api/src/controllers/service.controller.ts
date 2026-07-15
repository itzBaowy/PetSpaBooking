import { Request, Response, NextFunction } from "express";
import { responseSuccess } from "../common/helpers/function.helper.ts";
import { serviceService } from "../services/service.service.ts";

export const serviceController = {
    async uploadImages(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await serviceService.uploadImages(req);
            const response = responseSuccess(result, "Service images uploaded successfully", 201);
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await serviceService.create(req);
            const response = responseSuccess(result, "Service created successfully", 201);
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },

    async getMy(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await serviceService.getMy(req);
            const response = responseSuccess(result, "Services retrieved successfully");
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await serviceService.update(req);
            const response = responseSuccess(result, "Service updated successfully");
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },

    async toggle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await serviceService.toggle(req);
            const response = responseSuccess(
                result,
                result.isActive ? "Service is now visible" : "Service is now hidden"
            );
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },

    async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await serviceService.remove(req);
            const response = responseSuccess(result, "Service deleted successfully");
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await serviceService.getAll(req);
            const response = responseSuccess(result, "Services retrieved successfully");
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await serviceService.getById(req);
            const response = responseSuccess(result, "Service retrieved successfully");
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },

    async adminHide(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await serviceService.adminHide(req);
            const response = responseSuccess(result, "Service hidden by admin");
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },

    async adminUnhide(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await serviceService.adminUnhide(req);
            const response = responseSuccess(result, "Service unhidden by admin");
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },

    async getByProviderSlug(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await serviceService.getByProviderSlug(req);
            const response = responseSuccess(result, "Services retrieved successfully");
            res.status(response.statusCode).json(response);
        } catch (error) { next(error); }
    },
};
