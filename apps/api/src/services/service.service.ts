import { Request } from "express";
import prisma from "../../connect.prisma.ts";
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
} from "../common/helpers/exception.helper.ts";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.ts";

// ─── Constants ────────────────────────────────────────────────────────────────
const VALID_CATEGORIES = [
    "GROOMING",
    "SPA",
    "BOARDING",
    "TRAINING",
    "VETERINARY",
    "OTHER",
] as const;

type Category = (typeof VALID_CATEGORIES)[number];

// ─── Select ───────────────────────────────────────────────────────────────────
const SERVICE_SELECT = {
    id: true,
    providerId: true,
    name: true,
    description: true,
    price: true,
    duration: true,
    category: true,
    imageUrls: true,
    isActive: true,
    isHiddenByAdmin: true,
    createAt: true,
    updateAt: true,
} as const;

// ─── Helper ───────────────────────────────────────────────────────────────────
function getRequesterId(req: Request): string {
    const payload = (req as Request & { user?: { userId?: string } }).user;
    const userId = payload?.userId;
    if (!userId) throw new UnauthorizedException("Unauthorized");
    return userId;
}

/** Lấy providerId từ userId, đảm bảo đã được VERIFIED */
async function getVerifiedProviderId(userId: string): Promise<string> {
    const provider = await prisma.providers.findUnique({
        where: { userId },
        select: { id: true, providerStatus: true },
    });

    if (!provider) {
        throw new ForbiddenException("You do not have a provider profile. Please register first.");
    }

    if (provider.providerStatus !== "VERIFIED") {
        throw new ForbiddenException(
            `Your provider account is not verified yet (status: ${provider.providerStatus}).`
        );
    }

    return provider.id;
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const serviceService = {

    // ── Provider tạo service mới ──────────────────────────────────────────────
    async create(req: Request) {
        const userId = getRequesterId(req);
        const providerId = await getVerifiedProviderId(userId);

        const { name, description, price, duration, category, imageUrls } =
            req.body as {
                name: string;
                description?: string;
                price: number;
                duration: number;
                category?: string;
                imageUrls?: string[];
            };

        if (!name) throw new BadRequestException("name is required");
        if (price === undefined || price === null) throw new BadRequestException("price is required");
        if (!duration) throw new BadRequestException("duration is required");

        if (typeof price !== "number" || price < 0) {
            throw new BadRequestException("price must be a non-negative number");
        }
        if (typeof duration !== "number" || duration <= 0) {
            throw new BadRequestException("duration must be a positive number (in minutes)");
        }

        const resolvedCategory = category ?? "OTHER";
        if (!VALID_CATEGORIES.includes(resolvedCategory as Category)) {
            throw new BadRequestException(
                `Invalid category. Allowed: ${VALID_CATEGORIES.join(", ")}`
            );
        }

        const service = await prisma.services.create({
            data: {
                providerId,
                name,
                description: description ?? null,
                price,
                duration,
                category: resolvedCategory,
                imageUrls: imageUrls ?? [],
            },
            select: SERVICE_SELECT,
        });

        return service;
    },

    // ── Provider xem services của mình ───────────────────────────────────────
    async getMy(req: Request) {
        const userId = getRequesterId(req);
        const providerId = await getVerifiedProviderId(userId);

        const { page, pageSize, where, index } = buildQueryPrisma(
            req.query as Record<string, unknown>
        );

        // Chỉ lấy services của provider này
        where.providerId = providerId;

        // Filter theo category nếu có
        if (req.query.category && VALID_CATEGORIES.includes(req.query.category as Category)) {
            where.category = req.query.category;
        }

        // Filter theo isActive nếu có
        if (req.query.isActive !== undefined) {
            where.isActive = req.query.isActive === "true";
        }

        const [totalItem, items] = await Promise.all([
            prisma.services.count({ where }),
            prisma.services.findMany({
                where,
                select: SERVICE_SELECT,
                skip: index,
                take: pageSize,
                orderBy: { createAt: "desc" },
            }),
        ]);

        return { page, pageSize, totalItem, totalPage: Math.ceil(totalItem / pageSize), items };
    },

    // ── Provider cập nhật service ─────────────────────────────────────────────
    async update(req: Request) {
        const userId = getRequesterId(req);
        const providerId = await getVerifiedProviderId(userId);
        const { id } = req.params;

        const service = await prisma.services.findUnique({ where: { id } });
        if (!service) throw new NotFoundException("Service not found");
        if (service.providerId !== providerId) {
            throw new ForbiddenException("You can only edit your own services");
        }

        const { name, description, price, duration, category, imageUrls } =
            req.body as {
                name?: string;
                description?: string;
                price?: number;
                duration?: number;
                category?: string;
                imageUrls?: string[];
            };

        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (imageUrls !== undefined) updateData.imageUrls = imageUrls;

        if (price !== undefined) {
            if (typeof price !== "number" || price < 0) {
                throw new BadRequestException("price must be a non-negative number");
            }
            updateData.price = price;
        }

        if (duration !== undefined) {
            if (typeof duration !== "number" || duration <= 0) {
                throw new BadRequestException("duration must be a positive number");
            }
            updateData.duration = duration;
        }

        if (category !== undefined) {
            if (!VALID_CATEGORIES.includes(category as Category)) {
                throw new BadRequestException(
                    `Invalid category. Allowed: ${VALID_CATEGORIES.join(", ")}`
                );
            }
            updateData.category = category;
        }

        const updated = await prisma.services.update({
            where: { id },
            data: updateData,
            select: SERVICE_SELECT,
        });

        return updated;
    },

    // ── Provider toggle ẩn/hiện service ──────────────────────────────────────
    async toggle(req: Request) {
        const userId = getRequesterId(req);
        const providerId = await getVerifiedProviderId(userId);
        const { id } = req.params;

        const service = await prisma.services.findUnique({ where: { id } });
        if (!service) throw new NotFoundException("Service not found");
        if (service.providerId !== providerId) {
            throw new ForbiddenException("You can only manage your own services");
        }

        const updated = await prisma.services.update({
            where: { id },
            data: { isActive: !service.isActive },
            select: SERVICE_SELECT,
        });

        return updated;
    },

    // ── Provider xóa service (soft delete = isActive false) ──────────────────
    async remove(req: Request) {
        const userId = getRequesterId(req);
        const providerId = await getVerifiedProviderId(userId);
        const { id } = req.params;

        const service = await prisma.services.findUnique({ where: { id } });
        if (!service) throw new NotFoundException("Service not found");
        if (service.providerId !== providerId) {
            throw new ForbiddenException("You can only delete your own services");
        }

        await prisma.services.delete({ where: { id } });

        return { id };
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN endpoints
    // ─────────────────────────────────────────────────────────────────────────

    // ── Admin xem tất cả services ─────────────────────────────────────────────
    async getAll(req: Request) {
        const { page, pageSize, where, index } = buildQueryPrisma(
            req.query as Record<string, unknown>
        );

        if (req.query.category && VALID_CATEGORIES.includes(req.query.category as Category)) {
            where.category = req.query.category;
        }

        if (req.query.isActive !== undefined) {
            where.isActive = req.query.isActive === "true";
        }

        if (req.query.isHiddenByAdmin !== undefined) {
            where.isHiddenByAdmin = req.query.isHiddenByAdmin === "true";
        }

        const [totalItem, items] = await Promise.all([
            prisma.services.count({ where }),
            prisma.services.findMany({
                where,
                select: SERVICE_SELECT,
                skip: index,
                take: pageSize,
                orderBy: { createAt: "desc" },
            }),
        ]);

        return { page, pageSize, totalItem, totalPage: Math.ceil(totalItem / pageSize), items };
    },

    // ── Admin xem 1 service theo ID ───────────────────────────────────────────
    async getById(req: Request) {
        const { id } = req.params;
        const service = await prisma.services.findUnique({
            where: { id },
            select: SERVICE_SELECT,
        });
        if (!service) throw new NotFoundException("Service not found");
        return service;
    },

    // ── Admin ẩn service vi phạm ──────────────────────────────────────────────
    async adminHide(req: Request) {
        const { id } = req.params;
        const service = await prisma.services.findUnique({ where: { id } });
        if (!service) throw new NotFoundException("Service not found");

        if (service.isHiddenByAdmin) {
            throw new BadRequestException("Service is already hidden by admin");
        }

        const updated = await prisma.services.update({
            where: { id },
            data: { isHiddenByAdmin: true },
            select: SERVICE_SELECT,
        });

        return updated;
    },

    // ── Admin bỏ ẩn service ───────────────────────────────────────────────────
    async adminUnhide(req: Request) {
        const { id } = req.params;
        const service = await prisma.services.findUnique({ where: { id } });
        if (!service) throw new NotFoundException("Service not found");

        if (!service.isHiddenByAdmin) {
            throw new BadRequestException("Service is not hidden by admin");
        }

        const updated = await prisma.services.update({
            where: { id },
            data: { isHiddenByAdmin: false },
            select: SERVICE_SELECT,
        });

        return updated;
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC endpoint
    // ─────────────────────────────────────────────────────────────────────────

    // ── Public xem dịch vụ của 1 provider theo slug ───────────────────────────
    async getByProviderSlug(req: Request) {
        const { slug } = req.params;

        const provider = await prisma.providers.findUnique({
            where: { slug },
            select: { id: true, providerStatus: true },
        });

        if (!provider || provider.providerStatus !== "VERIFIED") {
            throw new NotFoundException("Provider not found");
        }

        const services = await prisma.services.findMany({
            where: {
                providerId: provider.id,
                isActive: true,
                isHiddenByAdmin: false,
            },
            select: SERVICE_SELECT,
            orderBy: { createAt: "desc" },
        });

        return services;
    },
};
