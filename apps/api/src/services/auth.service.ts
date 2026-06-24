import bcrypt from "bcrypt";
import { Request } from "express";
import { tokenService } from "./token.service.ts";
import { BadRequestException, UnauthorizedException } from "../common/helpers/exception.helper.ts";
import prisma from "./../../connect.prisma.ts";

export const authService = {
    async register(req: Request) {
        const { userName, password, email, phone } = req.body as { userName: string; password: string; email: string, phone: string };
        const userExist = await prisma.users.findUnique({ where: { userName } });
        if (!userName || !password || !email || !phone) {
            throw new BadRequestException("Please fill in all the required fields");
        }
        if (userExist) {
            throw new BadRequestException("User already exists");
        }
        const emailExist = await prisma.users.findUnique({ where: { email } });
        if (emailExist) {
            throw new BadRequestException("Email already exists");
        }

        const phoneExist = await prisma.users.findUnique({ where: { phone } });
        if (phoneExist) {
            throw new BadRequestException("Phone number already exists");
        }
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);
        const newUser = await prisma.users.create({
            data: { userName, password: hashPassword, email, phone },
        });
        const newUserId = newUser.id
        const tokens = tokenService.createTokens(newUserId);
        return tokens
    },

    async login(req: Request) {
        const { userName, password } = req.body as { userName: string; password: string };
        const userExist = await prisma.users.findUnique({ where: { userName } });
        if (!userName || !password) {
            throw new BadRequestException("Please fill in all the required fields");
        }
        if (!userExist) {
            throw new UnauthorizedException("Incorrect username or password");
        }

        // kiểm tra password
        const isMatch = bcrypt.compareSync(password, userExist.password);
        if (!isMatch) {
            throw new UnauthorizedException("Incorrect username or password");
        }

        const tokens = tokenService.createTokens(userExist.id);
        return tokens;
    },

    async getInfo(req: Request) {
        // req.user là JWT payload: { userId, iat, exp } — được gán bởi protect middleware
        const payload = (req as Request & { user?: { userId?: string } }).user;
        const userId = payload?.userId;
        if (!userId) {
            throw new UnauthorizedException("Unauthorized");
        }

        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                userName: true,
                email: true,
                phone: true,
                fullName: true,
                avatar: true,
                role: true,
                status: true,
                createAt: true,
                updateAt: true
            },
        });

        if (!user) {
            throw new UnauthorizedException("User not found");
        }

        return user;
    },
};
