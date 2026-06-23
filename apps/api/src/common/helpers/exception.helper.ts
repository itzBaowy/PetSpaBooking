import { statusCodes } from "./status-code.helper.ts";

export class BadRequestException extends Error {
    public code: number;
    constructor(message = `BadRequestException`) {
        super(message);
        this.name = "BadRequestException";
        this.code = statusCodes.BAD_REQUEST;
    }
}

export class UnauthorizedException extends Error {
    public code: number;
    constructor(message = `UnauthorizedException`) {
        super(message);
        this.name = "UnauthorizedException";
        this.code = statusCodes.UNAUTHORIZED;
    }
}

export class ForbiddenException extends Error {
    public code: number;
    constructor(message = `ForbiddenException`) {
        super(message);
        this.name = "ForbiddenException";
        this.code = statusCodes.FORBIDDEN;
    }
}

export class NotFoundException extends Error {
    public code: number;
    constructor(message = `NotFoundException`) {
        super(message);
        this.name = "NotFoundException";
        this.code = statusCodes.NOT_FOUND;
    }
}
