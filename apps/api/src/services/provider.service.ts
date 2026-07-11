import { Request } from "express";
import prisma from "../../connect.prisma.ts";
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
} from "../common/helpers/exception.helper.ts";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.ts";
import cloudinary from "../common/cloudinary/init.cloudinary.ts";
import { notificationService } from "./notification.service.ts";

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
    taxCode: true,
    identityNumber: true,
    identityFullName: true,
    identityDob: true,
    identityAddress: true,
    bankCode: true,
    bankAccountNumber: true,
    bankAccountName: true,
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
    cloudinaryPublicId: true,
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

function getRouteParam(req: Request, name: string): string {
    const value = req.params[name];
    if (typeof value !== "string" || !value) {
        throw new BadRequestException(`Invalid route parameter: ${name}`);
    }

    return value;
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
        const {
            userName,
            password,
            email,
            phone,
            businessName,
            description,
            address,
            taxCode,
            identityNumber,
            identityFullName,
            identityDob,
            identityAddress,
            bankCode,
            bankAccountNumber,
            bankAccountName,
            lat,
            lng,
        } = req.body as {
            userName?: string;
            password?: string;
            email?: string;
            phone?: string;
            businessName?: string;
            description?: string;
            address?: string;
            taxCode?: string;
            identityNumber?: string;
            identityFullName?: string;
            identityDob?: string;
            identityAddress?: string;
            bankCode?: string;
            bankAccountNumber?: string;
            bankAccountName?: string;
            lat?: number;
            lng?: number;
        };

        if (!userName || !password || !email || !phone || !businessName) {
            throw new BadRequestException("userName, password, email, phone, and businessName are required");
        }

        if (password.length < 6) {
            throw new BadRequestException("Password must be at least 6 characters");
        }

        // Kiểm tra unique trong bảng users
        const [existByUserName, existByEmail, existByPhone] = await Promise.all([
            prisma.users.findUnique({ where: { userName } }),
            prisma.users.findUnique({ where: { email } }),
            prisma.users.findUnique({ where: { phone } }),
        ]);

        if (existByUserName) throw new BadRequestException("Username already exists");
        if (existByEmail) throw new BadRequestException("Email already exists");
        if (existByPhone) throw new BadRequestException("Phone number already exists");

        // Hash password
        const bcrypt = await import("bcrypt");
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Tạo slug duy nhất cho Provider
        const baseSlug = generateSlug(businessName);
        const slug = await ensureUniqueSlug(baseSlug);

        // Transaction tạo User (role: PROVIDER) + ProviderProfile (status: PENDING_VERIFICATION)
        const [newUser, provider] = await prisma.$transaction(async (tx) => {
            const createdUser = await tx.users.create({
                data: {
                    userName,
                    email,
                    phone,
                    password: hashedPassword,
                    role: "PROVIDER",
                    status: "ACTIVE",
                },
            });

            const createdProvider = await tx.providers.create({
                data: {
                    userId: createdUser.id,
                    businessName,
                    slug,
                    description: description ?? null,
                    phone: phone ?? null,
                    email: email ?? null,
                    address: address ?? null,
                    taxCode: taxCode ?? null,
                    identityNumber: identityNumber ?? null,
                    identityFullName: identityFullName ?? null,
                    identityDob: identityDob ?? null,
                    identityAddress: identityAddress ?? null,
                    bankCode: bankCode ?? null,
                    bankAccountNumber: bankAccountNumber ?? null,
                    bankAccountName: bankAccountName ?? null,
                    lat: lat ?? null,
                    lng: lng ?? null,
                    providerStatus: "PENDING_VERIFICATION",
                },
                select: PROVIDER_SELECT,
            });

            return [createdUser, createdProvider];
        });

        const tokenService = (await import("./token.service.ts")).tokenService;
        const tokens = tokenService.createTokens(newUser.id);

        return { tokens, provider };
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

        const { documentType } = req.body as {
            documentType?: string;
        };

        if (!documentType || !req.file) {
            throw new BadRequestException("documentType and file are required");
        }

        if (!VALID_DOC_TYPES.includes(documentType as DocType)) {
            throw new BadRequestException(
                `Invalid documentType. Allowed: ${VALID_DOC_TYPES.join(", ")}`
            );
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

        const uploadResult = await new Promise<{ public_id: string; secure_url: string }>(
            (resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(
                        {
                            folder: "petlink/provider-documents",
                            resource_type: "image",
                        },
                        (error, result) => {
                            if (error || !result) {
                                reject(error ?? new Error("Cloudinary upload failed"));
                                return;
                            }
                            resolve({
                                public_id: result.public_id,
                                secure_url: result.secure_url,
                            });
                        },
                    )
                    .end(req.file!.buffer);
            },
        );

        const doc = await prisma.provider_documents.create({
            data: {
                providerId: provider.id,
                documentType,
                imageUrl: uploadResult.secure_url,
                cloudinaryPublicId: uploadResult.public_id,
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
        const docId = getRouteParam(req, "docId");

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

        // Clean up Cloudinary asset — log failures but don't block the response
        if (doc.cloudinaryPublicId) {
            cloudinary.uploader.destroy(doc.cloudinaryPublicId).catch((err: unknown) => {
                console.error("[deleteDocument] Failed to destroy Cloudinary asset:", err);
            });
        }

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
        const id = getRouteParam(req, "id");

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
        const id = getRouteParam(req, "id");

        const provider = await prisma.providers.findUnique({ where: { id } });
        if (!provider) throw new NotFoundException("Provider not found");

        if (provider.providerStatus === "VERIFIED") {
            throw new BadRequestException("Provider is already verified");
        }

        // Cập nhật provider status (KHÔNG sửa user role)
        const updatedProvider = await prisma.providers.update({
            where: { id },
            data: { providerStatus: "VERIFIED", adminNote: null },
            select: PROVIDER_SELECT,
        });

        await notificationService.create({
            userId: provider.userId,
            type: "PROVIDER_VERIFIED",
            title: "Provider verified",
            message: "Your provider profile has been verified.",
            data: { providerId: id },
        });

        return updatedProvider;
    },

    // ── Admin từ chối provider ────────────────────────────────────────────────
    async reject(req: Request) {
        const id = getRouteParam(req, "id");
        const { reason } = req.body as { reason?: string };

        if (!reason) throw new BadRequestException("Rejection reason is required");

        const provider = await prisma.providers.findUnique({ where: { id } });
        if (!provider) throw new NotFoundException("Provider not found");

        if (provider.providerStatus === "VERIFIED") {
            throw new BadRequestException("Cannot reject an already verified provider. Use suspend instead.");
        }

        // Cập nhật provider status (KHÔNG sửa user role)
        const updated = await prisma.providers.update({
            where: { id },
            data: { providerStatus: "REJECTED", adminNote: reason },
            select: PROVIDER_SELECT,
        });

        await notificationService.create({
            userId: provider.userId,
            type: "PROVIDER_REJECTED",
            title: "Provider rejected",
            message: "Your provider verification was rejected.",
            data: { providerId: id, reason },
        });

        return updated;
    },

    // ── Admin suspend/unsuspend provider ──────────────────────────────────────
    async suspend(req: Request) {
        const id = getRouteParam(req, "id");
        const { reason } = req.body as { reason?: string };

        const provider = await prisma.providers.findUnique({ where: { id } });
        if (!provider) throw new NotFoundException("Provider not found");

        if (provider.providerStatus !== "VERIFIED") {
            throw new BadRequestException("Only verified providers can be suspended");
        }

        const updatedProvider = await prisma.providers.update({
            where: { id },
            data: { providerStatus: "SUSPENDED", adminNote: reason ?? null },
            select: PROVIDER_SELECT,
        });

        return updatedProvider;
    },
};
