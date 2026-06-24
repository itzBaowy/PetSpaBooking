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
const VALID_PROVIDER_STATUSES = [
    "PENDING_VERIFICATION",
    "VERIFIED",
    "REJECTED",
    "SUSPENDED",
] as const;

const VALID_DOC_TYPES = [
    "business_license",
    "id_card_front",
    "id_card_back",
    "tax_code",
    "other",
] as const;

type ProviderStatus = (typeof VALID_PROVIDER_STATUSES)[number];
type DocType = (typeof VALID_DOC_TYPES)[number];

// ─── Select fields ────────────────────────────────────────────────────────────
const PROVIDER_SELECT = {
    id: true,
    userId: true,
    businessName: true,
    slug: true,
    description: true,
    avatarUrl: true,
    coverImageUrl: true,
    phone: true,
    email: true,
    address: true,
    lat: true,
    lng: true,
    providerStatus: true,
    depositStatus: true,
    depositBalance: true,
    walletBalance: true,
    cancellationRate: true,
    adminNote: true,
    createAt: true,
    updateAt: true,
} as const;

const DOC_SELECT = {
    id: true,
    providerId: true,
    documentType: true,
    imageUrl: true,
    status: true,
    adminNote: true,
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

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

async function ensureUniqueSlug(base: string): Promise<string> {
    let slug = base;
    let exists = await prisma.providers.findUnique({ where: { slug } });
    let counter = 1;
    while (exists) {
        slug = `${base}-${counter}`;
        exists = await prisma.providers.findUnique({ where: { slug } });
        counter++;
    }
    return slug;
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const providerService = {

    async register(req: Request) {
        const userId = getRequesterId(req);

        const user = await prisma.users.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException("User not found");
        if (user.role === "PROVIDER") {
            throw new BadRequestException("You are already a provider");
        }

        const existing = await prisma.providers.findUnique({ where: { userId } });

        // Chỉ chặn nếu đang PENDING hoặc đã VERIFIED/SUSPENDED
        if (existing && existing.providerStatus !== "REJECTED") {
            throw new BadRequestException(
                `You already have a provider application (status: ${existing.providerStatus})`
            );
        }

        const { businessName, description, phone, email, address, lat, lng } =
            req.body as {
                businessName: string;
                description?: string;
                phone?: string;
                email?: string;
                address?: string;
                lat?: number;
                lng?: number;
            };

        if (!businessName) {
            throw new BadRequestException("businessName is required");
        }

        // Nếu bị REJECTED trước đó → cập nhật lại thay vì tạo mới
        if (existing && existing.providerStatus === "REJECTED") {
            const baseSlug = generateSlug(businessName);
            // Chỉ tạo slug mới nếu businessName thay đổi
            const slug =
                generateSlug(businessName) === generateSlug(existing.businessName)
                    ? existing.slug
                    : await ensureUniqueSlug(baseSlug);

            const updated = await prisma.providers.update({
                where: { userId },
                data: {
                    businessName,
                    slug,
                    description: description ?? null,
                    phone: phone ?? null,
                    email: email ?? null,
                    address: address ?? null,
                    lat: lat ?? null,
                    lng: lng ?? null,
                    providerStatus: "PENDING_VERIFICATION",
                    adminNote: null, // xóa lý do reject cũ
                },
                select: PROVIDER_SELECT,
            });

            return updated;
        }

        // Tạo mới lần đầu
        const baseSlug = generateSlug(businessName);
        const slug = await ensureUniqueSlug(baseSlug);

        const provider = await prisma.providers.create({
            data: {
                userId,
                businessName,
                slug,
                description: description ?? null,
                phone: phone ?? null,
                email: email ?? null,
                address: address ?? null,
                lat: lat ?? null,
                lng: lng ?? null,
            },
            select: PROVIDER_SELECT,
        });

        return provider;
    },

    // ── Provider xem profile của mình ────────────────────────────────────────
    async getMe(req: Request) {
        const userId = getRequesterId(req);

        const provider = await prisma.providers.findUnique({
            where: { userId },
            select: PROVIDER_SELECT,
        });

        if (!provider) {
            throw new NotFoundException("Provider profile not found. Please register first.");
        }

        return provider;
    },

    // ── Provider cập nhật profile của mình ───────────────────────────────────
    async updateMe(req: Request) {
        const userId = getRequesterId(req);

        const provider = await prisma.providers.findUnique({ where: { userId } });
        if (!provider) {
            throw new NotFoundException("Provider profile not found");
        }

        const { businessName, description, avatarUrl, coverImageUrl, phone, email, address, lat, lng } =
            req.body as {
                businessName?: string;
                description?: string;
                avatarUrl?: string;
                coverImageUrl?: string;
                phone?: string;
                email?: string;
                address?: string;
                lat?: number;
                lng?: number;
            };

        const updateData: Record<string, unknown> = {};
        if (businessName !== undefined) {
            updateData.businessName = businessName;
            // Cập nhật slug nếu tên thay đổi
            const newBase = generateSlug(businessName);
            updateData.slug = await ensureUniqueSlug(newBase);
        }
        if (description !== undefined) updateData.description = description;
        if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
        if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl;
        if (phone !== undefined) updateData.phone = phone;
        if (email !== undefined) updateData.email = email;
        if (address !== undefined) updateData.address = address;
        if (lat !== undefined) updateData.lat = lat;
        if (lng !== undefined) updateData.lng = lng;

        const updated = await prisma.providers.update({
            where: { userId },
            data: updateData,
            select: PROVIDER_SELECT,
        });

        return updated;
    },

    // ── Upload verification documents ─────────────────────────────────────────
    async uploadDocument(req: Request) {
        const userId = getRequesterId(req);

        const provider = await prisma.providers.findUnique({ where: { userId } });
        if (!provider) {
            throw new NotFoundException("Provider profile not found");
        }

        if (provider.providerStatus === "VERIFIED") {
            throw new BadRequestException("Your account is already verified");
        }

        const { documentType, imageUrl } = req.body as {
            documentType?: string;
            imageUrl?: string;
        };

        if (!documentType || !imageUrl) {
            throw new BadRequestException("documentType and imageUrl are required");
        }

        if (!VALID_DOC_TYPES.includes(documentType as DocType)) {
            throw new BadRequestException(
                `Invalid documentType. Allowed: ${VALID_DOC_TYPES.join(", ")}`
            );
        }

        const doc = await prisma.provider_documents.create({
            data: {
                providerId: provider.id,
                documentType,
                imageUrl,
            },
            select: DOC_SELECT,
        });

        return doc;
    },

    // ── Provider xem danh sách documents của mình ─────────────────────────────
    async getMyDocuments(req: Request) {
        const userId = getRequesterId(req);

        const provider = await prisma.providers.findUnique({ where: { userId } });
        if (!provider) {
            throw new NotFoundException("Provider profile not found");
        }

        const docs = await prisma.provider_documents.findMany({
            where: { providerId: provider.id },
            select: DOC_SELECT,
            orderBy: { createAt: "desc" },
        });

        return docs;
    },

    // ── Provider xóa document (chỉ khi PENDING) ───────────────────────────────
    async deleteDocument(req: Request) {
        const userId = getRequesterId(req);
        const { docId } = req.params;

        const provider = await prisma.providers.findUnique({ where: { userId } });
        if (!provider) {
            throw new NotFoundException("Provider profile not found");
        }

        const doc = await prisma.provider_documents.findUnique({ where: { id: docId } });
        if (!doc) throw new NotFoundException("Document not found");
        if (doc.providerId !== provider.id) throw new ForbiddenException("Access denied");
        if (doc.status !== "PENDING") {
            throw new BadRequestException("Cannot delete a document that has been reviewed");
        }

        await prisma.provider_documents.delete({ where: { id: docId } });

        return { id: docId };
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN endpoints
    // ─────────────────────────────────────────────────────────────────────────

    // ── Admin lấy danh sách providers ────────────────────────────────────────
    async getAll(req: Request) {
        const { page, pageSize, where, index } = buildQueryPrisma(
            req.query as Record<string, unknown>
        );

        if (
            req.query.providerStatus &&
            VALID_PROVIDER_STATUSES.includes(req.query.providerStatus as ProviderStatus)
        ) {
            where.providerStatus = req.query.providerStatus;
        }

        const [totalItem, items] = await Promise.all([
            prisma.providers.count({ where }),
            prisma.providers.findMany({
                where,
                select: PROVIDER_SELECT,
                skip: index,
                take: pageSize,
                orderBy: { createAt: "desc" },
            }),
        ]);

        return { page, pageSize, totalItem, totalPage: Math.ceil(totalItem / pageSize), items };
    },

    // ── Admin xem provider theo ID ────────────────────────────────────────────
    async getById(req: Request) {
        const { id } = req.params;

        const provider = await prisma.providers.findUnique({
            where: { id },
            select: PROVIDER_SELECT,
        });
        if (!provider) throw new NotFoundException("Provider not found");

        const docs = await prisma.provider_documents.findMany({
            where: { providerId: id },
            select: DOC_SELECT,
            orderBy: { createAt: "desc" },
        });

        return { ...provider, documents: docs };
    },

    // ── Admin duyệt provider ──────────────────────────────────────────────────
    async approve(req: Request) {
        const { id } = req.params;

        const provider = await prisma.providers.findUnique({ where: { id } });
        if (!provider) throw new NotFoundException("Provider not found");

        if (provider.providerStatus === "VERIFIED") {
            throw new BadRequestException("Provider is already verified");
        }

        // Cập nhật provider status + user role trong 1 transaction
        const [updatedProvider] = await Promise.all([
            prisma.providers.update({
                where: { id },
                data: { providerStatus: "VERIFIED", adminNote: null },
                select: PROVIDER_SELECT,
            }),
            prisma.users.update({
                where: { id: provider.userId },
                data: { role: "PROVIDER" },
            }),
        ]);

        return updatedProvider;
    },

    // ── Admin từ chối provider ────────────────────────────────────────────────
    async reject(req: Request) {
        const { id } = req.params;
        const { reason } = req.body as { reason?: string };

        if (!reason) throw new BadRequestException("Rejection reason is required");

        const provider = await prisma.providers.findUnique({ where: { id } });
        if (!provider) throw new NotFoundException("Provider not found");

        if (provider.providerStatus === "VERIFIED") {
            throw new BadRequestException("Cannot reject an already verified provider. Use suspend instead.");
        }

        const updated = await prisma.providers.update({
            where: { id },
            data: { providerStatus: "REJECTED", adminNote: reason },
            select: PROVIDER_SELECT,
        });

        return updated;
    },

    // ── Admin suspend/unsuspend provider ──────────────────────────────────────
    async suspend(req: Request) {
        const { id } = req.params;
        const { reason } = req.body as { reason?: string };

        const provider = await prisma.providers.findUnique({ where: { id } });
        if (!provider) throw new NotFoundException("Provider not found");

        if (provider.providerStatus !== "VERIFIED") {
            throw new BadRequestException("Only verified providers can be suspended");
        }

        const [updatedProvider] = await Promise.all([
            prisma.providers.update({
                where: { id },
                data: { providerStatus: "SUSPENDED", adminNote: reason ?? null },
                select: PROVIDER_SELECT,
            }),
            prisma.users.update({
                where: { id: provider.userId },
                data: { role: "CUSTOMER" },
            }),
        ]);

        return updatedProvider;
    },
};
