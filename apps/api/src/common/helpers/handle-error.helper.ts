import { Request, Response, NextFunction } from "express";
import { responseError } from "./function.helper.ts";
import jwt from "jsonwebtoken";
import { statusCodes } from "./status-code.helper.ts";

export const appErorr = (
    err: Error & { code?: number },
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.log(`Error from middleware: `, err);

    if (err instanceof jwt.JsonWebTokenError) {
        (err as unknown as Error & { code: number }).code = statusCodes.UNAUTHORIZED;
        err.message = "Invalid Token";
    }
    if (err instanceof jwt.TokenExpiredError) {
        (err as unknown as Error & { code: number }).code = statusCodes.FORBIDDEN;
        err.message = "Token Expired";
    }

    let statusCode = Number(err?.code);
    if (isNaN(statusCode) || statusCode < 100 || statusCode > 599) {
        statusCode = statusCodes.INTERNAL_SERVER_ERROR;
    }

    const response = responseError(err?.message || "Internal Server Error", statusCode);
    res.status(response.statusCode).json(response);
};
