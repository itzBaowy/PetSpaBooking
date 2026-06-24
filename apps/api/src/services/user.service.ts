import { Request } from "express";
import prisma from "../../connect.prisma.ts";
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from "../common/helpers/exception.helper.ts";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.ts";

const USER_SELECT = {
    id: true,
    userName: true,
    email: true,
    phone: true,
    fullName: true,
    avatar: true,
    role: true,
    status: true,
    createAt: true,
    updateAt: true,
} as const;

const VALID_STATUSES = ["ACTIVE", "INACTIVE", "BANNED"] as const;
const VALID_ROLES = ["CUSTOMER", "ADMIN", "PROVIDER"] as const;

type UserStatus = (typeof VALID_STATUSES)[number];
type UserRole = (typeof VALID_ROLES)[number];

export const userService = {
    async getAll(req: Request) {
        const { page, pageSize, where, index } = buildQueryPrisma(req.query as Record<string, unknown>);

        // Lọc theo role nếu có và hợp lệ
        if (req.query.role && VALID_ROLES.includes(req.query.role as UserRole)) {
            where.role = req.query.role;
        }

        // Lọc theo status nếu có và hợp lệ
        if (req.query.status && VALID_STATUSES.includes(req.query.status as UserStatus)) {
            where.status = req.query.status;
        }

        const [totalItem, items] = await Promise.all([
            prisma.users.count({ where }),
            prisma.users.findMany({
                where,
                select: USER_SELECT,
                skip: index,
                take: pageSize,
                orderBy: { createAt: "desc" },
            }),
        ]);

        return {
            page,
            pageSize,
            totalItem,
            totalPage: Math.ceil(totalItem / pageSize),
            items,
        };
    },

    async getById(req: Request) {
        const { id } = req.params;
        const payload = (req as Request & { user?: { userId?: string } }).user;
        const requesterId = payload?.userId;

        // Chỉ admin hoặc chính user mới được xem
        const requester = await prisma.users.findUnique({
            where: { id: requesterId },
            select: { role: true },
        });

        if (!requester) {
            throw new ForbiddenException("Access denied");
        }

        const isAdmin = requester.role === "ADMIN";
        const isSelf = requesterId === id;

        if (!isAdmin && !isSelf) {
            throw new ForbiddenException("Access denied. You can only view your own profile.");
        }

        const user = await prisma.users.findUnique({
            where: { id },
            select: USER_SELECT,
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    },

    async create(req: Request) {
        const { userName, email, phone, fullName, avatar, role, status } =
            req.body as {
                userName: string;
                email: string;
                phone: string;
                fullName?: string;
                avatar?: string;
                role?: string;
                status?: string;
            };

        if (!userName || !email || !phone) {
            throw new BadRequestException(
                "userName, email, and phone are required"
            );
        }

        if (role && !VALID_ROLES.includes(role as UserRole)) {
            throw new BadRequestException(
                `Invalid role. Allowed: ${VALID_ROLES.join(", ")}`
            );
        }

        if (status && !VALID_STATUSES.includes(status as UserStatus)) {
            throw new BadRequestException(
                `Invalid status. Allowed: ${VALID_STATUSES.join(", ")}`
            );
        }

        // Check unique
        const [existByUserName, existByEmail, existByPhone] = await Promise.all([
            prisma.users.findUnique({ where: { userName } }),
            prisma.users.findUnique({ where: { email } }),
            prisma.users.findUnique({ where: { phone } }),
        ]);

        if (existByUserName) throw new BadRequestException("Username already exists");
        if (existByEmail) throw new BadRequestException("Email already exists");
        if (existByPhone) throw new BadRequestException("Phone already exists");

        // Admin tạo user không cần password — tự set random hoặc require
        const bcrypt = await import("bcrypt");
        const tempPassword = Math.random().toString(36).slice(-10);
        const hashedPassword = bcrypt.hashSync(tempPassword, 10);

        const newUser = await prisma.users.create({
            data: {
                userName,
                email,
                phone,
                fullName: fullName ?? null,
                avatar: avatar ?? null,
                password: hashedPassword,
                role: role ?? "CUSTOMER",
                status: status ?? "ACTIVE",
            },
            select: USER_SELECT,
        });

        return newUser;
    },

    // ── UPDATE (Admin: full | User: chỉ profile cá nhân) ────────────────
    async update(req: Request) {
        const { id } = req.params;
        const payload = (req as Request & { user?: { userId?: string } }).user;
        const requesterId = payload?.userId;

        const requester = await prisma.users.findUnique({
            where: { id: requesterId },
            select: { role: true },
        });

        if (!requester) {
            throw new ForbiddenException("Access denied");
        }

        const isAdmin = requester.role === "ADMIN";
        const isSelf = requesterId === id;

        if (!isAdmin && !isSelf) {
            throw new ForbiddenException(
                "Access denied. You can only update your own profile."
            );
        }

        // Check user tồn tại
        const existing = await prisma.users.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException("User not found");
        }

        const { fullName, avatar, phone, email, userName, role, status } =
            req.body as {
                fullName?: string;
                avatar?: string;
                phone?: string;
                email?: string;
                userName?: string;
                role?: string;
                status?: string;
            };

        // Non-admin chỉ được update profile fields (fullName, avatar, phone)
        // Admin được update tất cả
        const updateData: Record<string, unknown> = {};

        if (fullName !== undefined) updateData.fullName = fullName;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (phone !== undefined) updateData.phone = phone;

        if (isAdmin) {
            if (email !== undefined) updateData.email = email;
            if (userName !== undefined) updateData.userName = userName;

            if (role !== undefined) {
                if (!VALID_ROLES.includes(role as UserRole)) {
                    throw new BadRequestException(
                        `Invalid role. Allowed: ${VALID_ROLES.join(", ")}`
                    );
                }
                updateData.role = role;
            }

            if (status !== undefined) {
                if (!VALID_STATUSES.includes(status as UserStatus)) {
                    throw new BadRequestException(
                        `Invalid status. Allowed: ${VALID_STATUSES.join(", ")}`
                    );
                }
                updateData.status = status;
            }
        }

        // Check unique constraints khi update
        if (updateData.email && updateData.email !== existing.email) {
            const emailExist = await prisma.users.findUnique({
                where: { email: updateData.email as string },
            });
            if (emailExist) throw new BadRequestException("Email already exists");
        }

        if (updateData.userName && updateData.userName !== existing.userName) {
            const userNameExist = await prisma.users.findUnique({
                where: { userName: updateData.userName as string },
            });
            if (userNameExist) throw new BadRequestException("Username already exists");
        }

        if (updateData.phone && updateData.phone !== existing.phone) {
            const phoneExist = await prisma.users.findUnique({
                where: { phone: updateData.phone as string },
            });
            if (phoneExist) throw new BadRequestException("Phone already exists");
        }

        const updated = await prisma.users.update({
            where: { id },
            data: updateData,
            select: USER_SELECT,
        });

        return updated;
    },

    async remove(req: Request) {
        const { id } = req.params;

        const user = await prisma.users.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException("User not found");
        }

        if (user.status === "INACTIVE") {
            throw new BadRequestException("User is already inactive");
        }

        const updated = await prisma.users.update({
            where: { id },
            data: { status: "INACTIVE" },
            select: USER_SELECT,
        });

        return updated;
    },

    async updateRole(req: Request) {
        const { id } = req.params;
        const { role } = req.body as { role?: string };

        if (!role) {
            throw new BadRequestException("role is required");
        }

        if (!VALID_ROLES.includes(role as UserRole)) {
            throw new BadRequestException(
                `Invalid role. Allowed: ${VALID_ROLES.join(", ")}`
            );
        }

        const user = await prisma.users.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const updated = await prisma.users.update({
            where: { id },
            data: { role },
            select: USER_SELECT,
        });

        return updated;
    },
};
