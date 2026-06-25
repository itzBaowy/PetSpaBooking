import { Request } from "express";

export interface SuccessResponse<T = unknown> {
    status: "success";
    statusCode: number;
    message: string;
    data: T;
}

export interface ErrorResponse {
    status: "error";
    statusCode: number;
    message: string;
}

export function responseSuccess<T = unknown>(
    data: T,
    message = "ok",
    statusCode = 200
): SuccessResponse<T> {
    return {
        status: "success",
        statusCode,
        message,
        data,
    };
}

export function responseError(
    message = "Internal Server Error",
    statusCode = 500
): ErrorResponse {
    return {
        status: "error",
        statusCode,
        message,
    };
}