import { Request } from "express";
import bcrypt from "bcrypt";
import prisma from "../../connect.prisma.ts";
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
} from "../common/helpers/exception.helper.ts";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.ts";
import cloudinary from "../common/cloudinary/init.cloudinary.ts";

const FOLDER_IMAGE = "public/images";
const USER_LIST_SELECT = {
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

const USER_DETAIL_SELECT = {
    ...USER_LIST_SELECT,
    customers: {
        select: {
            id: true,
            location: true,
            pets: {
                select: {
                    id: true,
                    name: true,
                    breed: true,
                    gender: true,
                    ageLabel: true,
                    imageUrl: true,
                    status: true,
                    weight: true,
                    height: true,
                    color: true,
                    criticalNote: true,
                    nextVaccineDate: true,
                    photos: true,
                    createAt: true,
                    updateAt: true,
                },
                orderBy: { createAt: "desc" },
            },
        },
    },
} as const;

const VALID_STATUSES = ["ACTIVE", "INACTIVE", "BANNED"] as const;
const VALID_ROLES = ["CUSTOMER", "ADMIN", "PROVIDER"] as const;

type UserStatus = (typeof VALID_STATUSES)[number];
type UserRole = (typeof VALID_ROLES)[number];

function getCloudinaryPublicId(avatar?: string | null) {
    if (!avatar) return null;

    let path = avatar;
    try {
        if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
            const pathname = new URL(avatar).pathname;
            const uploadIndex = pathname.indexOf("/upload/");
            path = uploadIndex >= 0 ? pathname.slice(uploadIndex + "/upload/".length) : pathname;
            path = path.replace(/^v\d+\//, "");
        }
    } catch {
        path = avatar;
    }

    path = path.replace(/^\/+/, "").replace(/^v\d+\//, "");
    if (!path.startsWith(`${FOLDER_IMAGE}/`)) return null;

    return path.replace(/\.[^/.]+$/, "");
}

export const userService = {
    async getAll(req: Request) {
        const { page, pageSize, where, index } = buildQueryPrisma(req.query as Record<string, unknown>);

        if (req.query.role && VALID_ROLES.includes(req.query.role as UserRole)) {
            where.role = req.query.role;
        }

        if (req.query.status && VALID_STATUSES.includes(req.query.status as UserStatus)) {
            where.status = req.query.status;
        }

        const [totalItem, items] = await Promise.all([
            prisma.users.count({ where }),
            prisma.users.findMany({
                where,
                select: USER_LIST_SELECT,
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
        const id = req.params.id as string;
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
            throw new ForbiddenException("Access denied. You can only view your own profile.");
        }

        const user = await prisma.users.findUnique({
            where: { id },
            select: USER_DETAIL_SELECT,
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    },

    async create(req: Request) {
        const { userName, email, phone, fullName, avatar, role, status, password } =
            req.body as {
                userName: string;
                email: string;
                phone: string;
                password: string;
                fullName?: string;
                avatar?: string;
                role?: string;
                status?: string;
            };

        if (!userName || !email || !phone || !password) {
            throw new BadRequestException(
                "userName, email, phone, and password are required"
            );
        }

        if (password.length < 6) {
            throw new BadRequestException(
                "Password must be at least 6 characters"
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

        const [existByUserName, existByEmail, existByPhone] = await Promise.all([
            prisma.users.findUnique({ where: { userName } }),
            prisma.users.findUnique({ where: { email } }),
            prisma.users.findUnique({ where: { phone } }),
        ]);

        if (existByUserName) throw new BadRequestException("Username already exists");
        if (existByEmail) throw new BadRequestException("Email already exists");
        if (existByPhone) throw new BadRequestException("Phone already exists");

        const bcrypt = await import("bcrypt");
        const hashedPassword = bcrypt.hashSync(password, 10);

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
            select: USER_LIST_SELECT,
        });

        return newUser;
    },

    async update(req: Request) {
        const id = req.params.id as string;
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
            select: USER_LIST_SELECT,
        });

        return updated;
    },

    async changePassword(req: Request) {
        const payload = (req as Request & { user?: { userId?: string } }).user;
        const userId = payload?.userId;
        if (!userId) {
            throw new UnauthorizedException("Unauthorized");
        }

        const { currentPassword, newPassword, confirmPassword } = req.body as {
            currentPassword?: string;
            newPassword?: string;
            confirmPassword?: string;
        };

        if (!currentPassword || !newPassword || !confirmPassword) {
            throw new BadRequestException(
                "currentPassword, newPassword, and confirmPassword are required",
            );
        }

        if (newPassword.length < 6) {
            throw new BadRequestException("New password must be at least 6 characters");
        }

        if (newPassword !== confirmPassword) {
            throw new BadRequestException("New password and confirmPassword do not match");
        }

        if (currentPassword === newPassword) {
            throw new BadRequestException("New password must be different from current password");
        }

        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                password: true,
            },
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        const isMatch = bcrypt.compareSync(currentPassword, user.password);
        if (!isMatch) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        await prisma.users.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        return { changed: true };
    },

    async remove(req: Request) {
        const id = req.params.id as string;

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
            select: USER_LIST_SELECT,
        });

        return updated;
    },

    async updateRole(req: Request) {
        const id = req.params.id as string;
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
            select: USER_LIST_SELECT,
        });

        return updated;
    },

    async avatarCloud(req: Request) {
        if (!req.file) {
            throw new BadRequestException("No file uploaded");
        }

        // Defensive service-layer validation (belt-and-suspenders after multer fileFilter)
        const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
        const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB
        if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
            throw new BadRequestException(
                `Unsupported file type: ${req.file.mimetype}. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
            );
        }
        if (req.file.size > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds the 8 MB limit.");
        }

        const payload = (req as Request & { user?: { userId?: string } }).user;
        const userId = payload?.userId;
        if (!userId) {
            throw new BadRequestException("User not authenticated");
        }

        const currentUser = await prisma.users.findUnique({
            where: { id: userId },
            select: { avatar: true },
        });

        if (!currentUser) {
            throw new NotFoundException("User not found");
        }

        const uploadResult = await new Promise<{
            public_id: string;
            secure_url: string;
        }>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: FOLDER_IMAGE },
                (error, result) => {
                    if (error || !result) {
                        return reject(error ?? new Error("Cloudinary upload failed"));
                    }
                    resolve({
                        public_id: result.public_id,
                        secure_url: result.secure_url,
                    });
                }
            ).end(req.file!.buffer);
        });

        const relativeAvatarPath = uploadResult.secure_url.includes(FOLDER_IMAGE)
            ? uploadResult.secure_url.substring(uploadResult.secure_url.indexOf(FOLDER_IMAGE))
            : uploadResult.secure_url;

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: {
                avatar: relativeAvatarPath,
            },
            select: USER_LIST_SELECT,
        });

        const oldPublicId = getCloudinaryPublicId(currentUser.avatar);
        if (oldPublicId) {
            cloudinary.uploader.destroy(oldPublicId).catch((err: unknown) => {
                console.error("[avatarCloud] Failed to destroy old Cloudinary asset:", err);
            });
        }

        const providerProfile = await prisma.providers.findUnique({
            where: { userId },
            select: {
                id: true,
                providerStatus: true,
            },
        });

        return {
            ...updatedUser,
            providerProfileId: providerProfile?.id ?? null,
            providerStatus: providerProfile?.providerStatus ?? null,
            providerVerificationStatus: providerProfile?.providerStatus ?? null,
        };
    },
};
