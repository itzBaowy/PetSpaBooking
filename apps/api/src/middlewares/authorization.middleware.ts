import { Request, Response, NextFunction } from "express";
import { ForbiddenException, UnauthorizedException } from "../common/helpers/exception.helper.ts";
import prisma from "../../connect.prisma.ts";

/**
 * Middleware factory để kiểm tra role của user.
 * Phải dùng sau `protect` middleware (req.user đã được gán).
 *
 * @param roles - Một hoặc nhiều role được phép truy cập
 *
 * @example
 * // Chỉ cho phép ADMIN
 * router.get("/", protect, checkRole("ADMIN"), controller.getAll);
 *
 * @example
 * // Cho phép cả ADMIN và PROVIDER
 * router.get("/", protect, checkRole("ADMIN", "PROVIDER"), controller.getAll);
 */
export const checkRole = (...roles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const payload = (req as Request & { user?: { userId?: string } }).user;
            const userId = payload?.userId;

            if (!userId) {
                throw new UnauthorizedException("Unauthorized");
            }

            const user = await prisma.users.findUnique({
                where: { id: userId },
                select: { role: true, status: true },
            });

            if (!user) {
                throw new UnauthorizedException("User not found");
            }

            if (!roles.includes(user.role)) {
                throw new ForbiddenException(
                    `Access denied. Required role: ${roles.join(" or ")}.`
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
