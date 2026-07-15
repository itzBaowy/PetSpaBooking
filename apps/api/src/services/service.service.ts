import { Request } from "express";
import prisma from "../../connect.prisma.ts";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "../common/helpers/exception.helper.ts";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.ts";
import { notificationService } from "./notification.service.ts";
import { adminAuditLogService } from "./admin-audit-log.service.ts";
import { getSystemSettingValue } from "./system-setting.service.ts";
import cloudinary from "../common/cloudinary/init.cloudinary.ts";

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
type ServiceImageUpload = {
  publicId: string;
  secureUrl: string;
};

// ─── Select ───────────────────────────────────────────────────────────────────
const SERVICE_SELECT = {
  id: true,
  providerId: true,
  name: true,
  description: true,
  longDescription: true,
  price: true,
  duration: true,
  category: true,
  imageUrls: true,
  targetPets: true,
  benefits: true,
  isActive: true,
  isHiddenByAdmin: true,
  createAt: true,
  updateAt: true,
} as const;

const ADMIN_SERVICE_INCLUDE = {
  provider: {
    select: {
      id: true,
      userId: true,
      businessName: true,
      providerStatus: true,
      depositStatus: true,
    },
  },
} as const;

// ─── Helper ───────────────────────────────────────────────────────────────────
function getRequesterId(req: Request): string {
  const payload = (req as Request & { user?: { userId?: string } }).user;
  const userId = payload?.userId;
  if (!userId) throw new UnauthorizedException("Unauthorized");
  return userId;
}

/** Lấy providerId từ userId, đảm bảo đã được VERIFIED */
function getRouteParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string" || !value) {
    throw new BadRequestException(`Invalid route parameter: ${name}`);
  }

  return value;
}

function getOptionalReason(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestException("reason must be a non-empty string");
  }

  return value.trim();
}

function parseOptionalString(value: unknown, fieldName: string) {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw new BadRequestException(`${fieldName} must be a string`);
  }

  return value.trim();
}

function parseRequiredString(value: unknown, fieldName: string) {
  const parsed = parseOptionalString(value, fieldName);
  if (!parsed) throw new BadRequestException(`${fieldName} is required`);
  return parsed;
}

function parseOptionalNumber(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === "") return undefined;
  const numberValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new BadRequestException(`${fieldName} must be a valid number`);
  }

  return numberValue;
}

function parseStringArray(value: unknown, fieldName: string): string[] {
  if (value === undefined || value === null || value === "") return [];

  if (Array.isArray(value)) {
    if (value.some((item) => typeof item !== "string")) {
      throw new BadRequestException(`${fieldName} must be an array of strings`);
    }

    return value.map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value !== "string") {
    throw new BadRequestException(`${fieldName} must be an array of strings`);
  }

  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      if (parsed.some((item) => typeof item !== "string")) {
        throw new BadRequestException(
          `${fieldName} must be an array of strings`,
        );
      }

      return parsed.map((item) => item.trim()).filter(Boolean);
    }
  } catch {
    // Fallback below allows multipart forms to send comma-separated values.
  }

  return trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function assertImageUrls(imageUrls: string[]) {
  if (imageUrls.length === 0) {
    throw new BadRequestException(
      "imageUrls must contain at least one uploaded service image URL",
    );
  }

  for (const imageUrl of imageUrls) {
    try {
      const parsed = new URL(imageUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      throw new BadRequestException("imageUrls must contain valid URL strings");
    }
  }
}

function getServiceImageFiles(req: Request) {
  return (Array.isArray(req.files) ? req.files : []) as Express.Multer.File[];
}

async function uploadServiceImageFiles(files: Express.Multer.File[]) {
  const uploaded: ServiceImageUpload[] = [];

  try {
    for (const file of files) {
      const result = await new Promise<ServiceImageUpload>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "petlink/services",
                resource_type: "image",
                use_filename: true,
                unique_filename: true,
              },
              (error, result) => {
                if (error || !result) {
                  reject(error ?? new Error("Cloudinary upload failed"));
                  return;
                }

                resolve({
                  publicId: result.public_id,
                  secureUrl: result.secure_url,
                });
              },
            )
            .end(file.buffer);
        },
      );

      uploaded.push(result);
    }

    return uploaded;
  } catch (error) {
    await deleteUploadedServiceImages(uploaded);
    throw error;
  }
}

async function deleteUploadedServiceImages(images: ServiceImageUpload[]) {
  await Promise.allSettled(
    images.map((image) =>
      cloudinary.uploader.destroy(image.publicId, { resource_type: "image" }),
    ),
  );
}

async function getVerifiedProviderId(userId: string): Promise<string> {
  const minProviderDeposit = await getSystemSettingValue("minProviderDeposit");
  const provider = await prisma.providers.findUnique({
    where: { userId },
    select: {
      id: true,
      providerStatus: true,
      depositStatus: true,
      depositBalance: true,
    },
  });

  if (!provider) {
    throw new ForbiddenException(
      "You do not have a provider profile. Please register first.",
    );
  }

  if (provider.providerStatus !== "VERIFIED") {
    throw new ForbiddenException(
      `Your provider account is not verified yet (status: ${provider.providerStatus}).`,
    );
  }

  if (
    provider.depositStatus !== "ACTIVE" ||
    provider.depositBalance < minProviderDeposit
  ) {
    throw new ForbiddenException(
      `Provider deposit must be ACTIVE and at least ${minProviderDeposit} VND before managing services.`,
    );
  }

  return provider.id;
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const serviceService = {
  async uploadImages(req: Request) {
    const userId = getRequesterId(req);
    await getVerifiedProviderId(userId);

    const files = getServiceImageFiles(req);
    if (files.length === 0) {
      throw new BadRequestException(
        "At least one image is required. Use multipart field images.",
      );
    }

    const uploadedImages = await uploadServiceImageFiles(files);

    return {
      imageUrls: uploadedImages.map((image) => image.secureUrl),
      images: uploadedImages.map((image) => ({
        url: image.secureUrl,
        publicId: image.publicId,
      })),
    };
  },

  // ── Provider tạo service mới ──────────────────────────────────────────────
  async create(req: Request) {
    const userId = getRequesterId(req);
    const providerId = await getVerifiedProviderId(userId);

    const name = parseRequiredString(req.body?.name, "name");
    const description = parseOptionalString(req.body?.description, "description");
    const longDescription = parseOptionalString(
      req.body?.longDescription,
      "longDescription",
    );
    const price = parseOptionalNumber(req.body?.price, "price");
    const duration = parseOptionalNumber(req.body?.duration, "duration");
    const category = parseOptionalString(req.body?.category, "category");
    const targetPets = parseStringArray(req.body?.targetPets, "targetPets");
    const benefits = parseStringArray(req.body?.benefits, "benefits");
    const existingImageUrls = parseStringArray(req.body?.imageUrls, "imageUrls");

    if (price === undefined) throw new BadRequestException("price is required");
    if (duration === undefined) {
      throw new BadRequestException("duration is required");
    }

    if (price < 0) {
      throw new BadRequestException("price must be a non-negative number");
    }
    if (duration <= 0) {
      throw new BadRequestException(
        "duration must be a positive number (in minutes)",
      );
    }

    const resolvedCategory = category ?? "OTHER";
    if (!VALID_CATEGORIES.includes(resolvedCategory as Category)) {
      throw new BadRequestException(
        `Invalid category. Allowed: ${VALID_CATEGORIES.join(", ")}`,
      );
    }

    assertImageUrls(existingImageUrls);

    return prisma.services.create({
      data: {
        providerId,
        name,
        description: description || null,
        longDescription: longDescription || "",
        price,
        duration,
        category: resolvedCategory,
        imageUrls: existingImageUrls,
        targetPets,
        benefits,
      },
      select: SERVICE_SELECT,
    });
  },

  // ── Provider xem services của mình ───────────────────────────────────────
  async getMy(req: Request) {
    const userId = getRequesterId(req);
    const providerId = await getVerifiedProviderId(userId);

    const { page, pageSize, where, index } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );

    // Chỉ lấy services của provider này
    where.providerId = providerId;

    // Filter theo category nếu có
    if (
      req.query.category &&
      VALID_CATEGORIES.includes(req.query.category as Category)
    ) {
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

    return {
      page,
      pageSize,
      totalItem,
      totalPage: Math.ceil(totalItem / pageSize),
      items,
    };
  },

  // ── Provider cập nhật service ─────────────────────────────────────────────
  async update(req: Request) {
    const userId = getRequesterId(req);
    const providerId = await getVerifiedProviderId(userId);
    const id = getRouteParam(req, "id");

    const service = await prisma.services.findUnique({ where: { id } });
    if (!service) throw new NotFoundException("Service not found");
    if (service.providerId !== providerId) {
      throw new ForbiddenException("You can only edit your own services");
    }

    const name = parseOptionalString(req.body?.name, "name");
    const description = parseOptionalString(req.body?.description, "description");
    const longDescription = parseOptionalString(
      req.body?.longDescription,
      "longDescription",
    );
    const price = parseOptionalNumber(req.body?.price, "price");
    const duration = parseOptionalNumber(req.body?.duration, "duration");
    const category = parseOptionalString(req.body?.category, "category");
    const targetPets =
      req.body?.targetPets === undefined
        ? undefined
        : parseStringArray(req.body?.targetPets, "targetPets");
    const benefits =
      req.body?.benefits === undefined
        ? undefined
        : parseStringArray(req.body?.benefits, "benefits");
    const existingImageUrls =
      req.body?.imageUrls === undefined
        ? undefined
        : parseStringArray(req.body?.imageUrls, "imageUrls");

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (longDescription !== undefined) {
      updateData.longDescription = longDescription;
    }
    if (targetPets !== undefined) updateData.targetPets = targetPets;
    if (benefits !== undefined) updateData.benefits = benefits;

    if (price !== undefined) {
      if (price < 0) {
        throw new BadRequestException("price must be a non-negative number");
      }
      updateData.price = price;
    }

    if (duration !== undefined) {
      if (duration <= 0) {
        throw new BadRequestException("duration must be a positive number");
      }
      updateData.duration = duration;
    }

    if (category !== undefined) {
      if (!VALID_CATEGORIES.includes(category as Category)) {
        throw new BadRequestException(
          `Invalid category. Allowed: ${VALID_CATEGORIES.join(", ")}`,
        );
      }
      updateData.category = category;
    }

    if (existingImageUrls !== undefined) {
      assertImageUrls(existingImageUrls);
      updateData.imageUrls = existingImageUrls;
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
    const id = getRouteParam(req, "id");

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
    const id = getRouteParam(req, "id");

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
      req.query as Record<string, unknown>,
    );

    if (
      req.query.category &&
      VALID_CATEGORIES.includes(req.query.category as Category)
    ) {
      where.category = req.query.category;
    }

    if (req.query.isActive !== undefined) {
      where.isActive = req.query.isActive === "true";
    }

    if (req.query.isHiddenByAdmin !== undefined) {
      where.isHiddenByAdmin = req.query.isHiddenByAdmin === "true";
    }

    if (typeof req.query.providerId === "string" && req.query.providerId) {
      where.providerId = req.query.providerId;
    }

    if (typeof req.query.keyword === "string" && req.query.keyword.trim()) {
      where.OR = [
        {
          name: {
            contains: req.query.keyword.trim(),
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: req.query.keyword.trim(),
            mode: "insensitive",
          },
        },
      ];
    }

    const [totalItem, items] = await Promise.all([
      prisma.services.count({ where }),
      prisma.services.findMany({
        where,
        include: ADMIN_SERVICE_INCLUDE,
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

  // ── Admin xem 1 service theo ID ───────────────────────────────────────────
  async getById(req: Request) {
    const id = getRouteParam(req, "id");
    const service = await prisma.services.findUnique({
      where: { id },
      include: ADMIN_SERVICE_INCLUDE,
    });
    if (!service) throw new NotFoundException("Service not found");
    return service;
  },

  // ── Admin ẩn service vi phạm ──────────────────────────────────────────────
  async adminHide(req: Request) {
    const adminId = getRequesterId(req);
    const id = getRouteParam(req, "id");
    const reason = getOptionalReason(req.body?.reason);
    const service = await prisma.services.findUnique({
      where: { id },
      include: ADMIN_SERVICE_INCLUDE,
    });
    if (!service) throw new NotFoundException("Service not found");

    if (service.isHiddenByAdmin) {
      throw new BadRequestException("Service is already hidden by admin");
    }

    const updated = await prisma.services.update({
      where: { id },
      data: { isHiddenByAdmin: true },
      select: SERVICE_SELECT,
    });

    await notificationService.safeCreate({
      userId: service.provider.userId,
      type: "SERVICE_HIDDEN_BY_ADMIN",
      title: "Service hidden by admin",
      message: "One of your services was hidden by admin.",
      data: {
        serviceId: service.id,
        providerId: service.providerId,
        reason,
      },
    });

    await adminAuditLogService.safeLog({
      adminId,
      action: "SERVICE_HIDE",
      targetType: "SERVICE",
      targetId: service.id,
      metadata: {
        providerId: service.providerId,
        serviceName: service.name,
        reason,
      },
    });

    return updated;
  },

  // ── Admin bỏ ẩn service ───────────────────────────────────────────────────
  async adminUnhide(req: Request) {
    const adminId = getRequesterId(req);
    const id = getRouteParam(req, "id");
    const service = await prisma.services.findUnique({
      where: { id },
      include: ADMIN_SERVICE_INCLUDE,
    });
    if (!service) throw new NotFoundException("Service not found");

    if (!service.isHiddenByAdmin) {
      throw new BadRequestException("Service is not hidden by admin");
    }

    const updated = await prisma.services.update({
      where: { id },
      data: { isHiddenByAdmin: false },
      select: SERVICE_SELECT,
    });

    await notificationService.safeCreate({
      userId: service.provider.userId,
      type: "SERVICE_UNHIDDEN_BY_ADMIN",
      title: "Service unhidden by admin",
      message: "One of your services is visible again.",
      data: {
        serviceId: service.id,
        providerId: service.providerId,
      },
    });

    await adminAuditLogService.safeLog({
      adminId,
      action: "SERVICE_UNHIDE",
      targetType: "SERVICE",
      targetId: service.id,
      metadata: {
        providerId: service.providerId,
        serviceName: service.name,
      },
    });

    return updated;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC endpoint
  // ─────────────────────────────────────────────────────────────────────────

  // ── Public xem dịch vụ của 1 provider theo slug ───────────────────────────
  async getByProviderSlug(req: Request) {
    const slug = getRouteParam(req, "slug");

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
