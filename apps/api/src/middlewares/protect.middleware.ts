import { Request, Response, NextFunction } from "express";
import { tokenService } from "../services/token.service.ts";
import { UnauthorizedException } from "../common/helpers/exception.helper.ts";

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

        // Gán thông tin user vào request để các handler tiếp theo dùng
        (req as Request & { user?: unknown }).user = decoded;

        next();
    } catch (error) {
        next(error);
    }
};
