import { Request, Response, NextFunction } from "express";
import { tokenService } from "../services/token.service.ts";
import { ForbiddenException, UnauthorizedException } from "../common/helpers/exception.helper.ts";
import prisma from "../../connect.prisma.ts";

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization) {
            throw new UnauthorizedException("No authorization");
        }

        const [type, token] = authorization.split(" ");
        if (type !== "Bearer") {
            throw new UnauthorizedException("Token is not Bearer");
        }
        if (!token) {
            throw new UnauthorizedException("No token");
        }

        const decoded = tokenService.verifyAccessToken(token);
        const userId = (decoded as { userId?: string }).userId;

        if (!userId) {
            throw new UnauthorizedException("Invalid token payload");
        }

        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { status: true },
        });

        if (!user) {
            throw new UnauthorizedException("Account not found");
        }

        if (user.status === "INACTIVE") {
            throw new ForbiddenException("Your account has been deactivated.");
        }

        if (user.status === "BANNED") {
            throw new ForbiddenException("Your account has been banned.");
        }

        (req as Request & { user?: unknown }).user = decoded;

        next();
    } catch (error) {
        next(error);
    }
};
