//Service dành riêng cho mobile

import { Request } from "express";
import { buildQueryPrisma } from "../../common/helpers/build-query-prisma.helper.ts";
import prisma from "../../../connect.prisma.ts";
import {
  checkAvailability,
  getDistanceKm,
} from "../../common/helpers/provider.helper.ts";
import { getQueryString } from "../../common/helpers/paramHelper.ts";
import {
  GlobalSearchResponse,
  GlobalSearchServiceItem,
  ProviderItem,
} from "../../types/mobile-types/provider.types.ts";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../../common/helpers/exception.helper.ts";
import { ObjectId } from "mongodb";
import { getSystemSettingValue } from "../system-setting.service.ts";
import { notificationService } from "../notification.service.ts";

function getRequesterId(req: Request): string {
  const userId = (req as Request & { user?: { userId?: string } }).user?.userId;
  if (!userId) throw new UnauthorizedException("Unauthorized");
  return userId;
}

function parseOptionalNumber(
  value: unknown,
  fieldName: string,
): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    throw new BadRequestException(`${fieldName} must be a valid number`);
  }

  return numericValue;
}

function getRouteObjectId(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string" || !ObjectId.isValid(value)) {
    throw new BadRequestException(`Invalid route parameter: ${name}`);
  }

  return value;
}

type EvidenceItem = {
  url: string;
  type?: string;
  title?: string;
  note?: string;
};

function getEvidence(value: unknown, fieldName: string): EvidenceItem[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    throw new BadRequestException(`${fieldName} must be an array`);
  }
  if (value.length > 10) {
    throw new BadRequestException(`${fieldName} can contain at most 10 items`);
  }

  return value.map((item, index) => {
    if (typeof item === "string") {
      const url = item.trim();
      if (!url) {
        throw new BadRequestException(`${fieldName}[${index}] url is required`);
      }
      return { url };
    }

    if (typeof item !== "object" || item === null) {
      throw new BadRequestException(
        `${fieldName}[${index}] must be a string URL or object`,
      );
    }

    const raw = item as Record<string, unknown>;
    if (typeof raw.url !== "string" || !raw.url.trim()) {
      throw new BadRequestException(`${fieldName}[${index}].url is required`);
    }

    return {
      url: raw.url.trim(),
      type: typeof raw.type === "string" ? raw.type.trim() : undefined,
      title: typeof raw.title === "string" ? raw.title.trim() : undefined,
      note: typeof raw.note === "string" ? raw.note.trim() : undefined,
    };
  });
}

function encodeEvidence(evidence: EvidenceItem[]) {
  return evidence.length > 0 ? JSON.stringify(evidence) : null;
}

function decodeEvidence(value: string | null | undefined): EvidenceItem[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is EvidenceItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as { url?: unknown }).url === "string",
    );
  } catch {
    return [];
  }
}

function mapDisputeForProvider(dispute: {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  reason: string;
  description: string | null;
  evidence: string | null;
  providerResponse: string | null;
  providerEvidence: string | null;
  providerRespondedAt: Date | null;
  status: string;
  resolvedAt: Date | null;
  adminNote: string | null;
  createAt: Date;
  updateAt: Date;
  booking?: unknown;
}) {
  return {
    id: dispute.id,
    bookingId: dispute.bookingId,
    customerId: dispute.customerId,
    providerId: dispute.providerId,
    reason: dispute.reason,
    description: dispute.description,
    evidence: decodeEvidence(dispute.evidence),
    providerResponse: dispute.providerResponse,
    providerEvidence: decodeEvidence(dispute.providerEvidence),
    providerRespondedAt: dispute.providerRespondedAt,
    status: dispute.status,
    resolvedAt: dispute.resolvedAt,
    adminNote: dispute.adminNote,
    createdAt: dispute.createAt,
    updatedAt: dispute.updateAt,
    booking: dispute.booking,
  };
}

export const mobileProviderServices = {
  async searchGlobal(req: Request): Promise<GlobalSearchResponse> {
    const { page, pageSize, index } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );

    const { userLat, userLng, category } = req.query;
    const searchTerm =
      typeof req.query.q === "string"
        ? req.query.q.trim()
        : typeof req.query.searchKey === "string"
          ? req.query.searchKey.trim()
          : undefined;

    if (!searchTerm) {
      return {
        providers: [],
        services: [],
      };
    }

    const providerWhere: Record<string, unknown> = {
      providerStatus: "VERIFIED",
      OR: [
        {
          businessName: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          services: {
            some: {
              name: {
                contains: searchTerm,
                mode: "insensitive",
              },
              isActive: true,
              isHiddenByAdmin: false,
            },
          },
        },
      ],
    };

    const serviceWhere: Record<string, unknown> = {
      isActive: true,
      isHiddenByAdmin: false,
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          longDescription: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          provider: {
            businessName: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
      ],
    };

    if (typeof category === "string" && category) {
      serviceWhere.category = category;
    }

    const [rawProviders, rawServices] = await Promise.all([
      prisma.providers.findMany({
        where: providerWhere,
        select: {
          businessName: true,
        },
        orderBy: { createAt: "desc" },
        skip: index,
        take: pageSize,
      }),
      prisma.services.findMany({
        where: serviceWhere,
        select: {
          name: true,
        },
        orderBy: { createAt: "desc" },
        skip: index,
        take: pageSize,
      }),
    ]);

    return {
      providers: rawProviders.map((p) => p.businessName),
      services: rawServices.map((s) => s.name),
    };
  },

  async getAllProviders(req: Request) {
    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );

    const { userLat, userLng, category } = req.query;
    const searchKey =
      typeof req.query.searchKey === "string"
        ? req.query.searchKey.trim()
        : undefined;

    const minRating = parseOptionalNumber(req.query.minRating, "minRating");
    const maxRating = parseOptionalNumber(req.query.maxRating, "maxRating");
    const minPrice = parseOptionalNumber(req.query.minPrice, "minPrice");
    const maxPrice = parseOptionalNumber(req.query.maxPrice, "maxPrice");

    if (minRating !== undefined && (minRating < 0 || minRating > 5)) {
      throw new BadRequestException("minRating must be between 0 and 5");
    }

    if (maxRating !== undefined && (maxRating < 0 || maxRating > 5)) {
      throw new BadRequestException("maxRating must be between 0 and 5");
    }

    if (minPrice !== undefined && minPrice < 0) {
      throw new BadRequestException(
        "minPrice must be greater than or equal to 0",
      );
    }

    if (maxPrice !== undefined && maxPrice < 0) {
      throw new BadRequestException(
        "maxPrice must be greater than or equal to 0",
      );
    }

    if (
      minRating !== undefined &&
      maxRating !== undefined &&
      minRating > maxRating
    ) {
      throw new BadRequestException(
        "minRating cannot be greater than maxRating",
      );
    }

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      throw new BadRequestException("minPrice cannot be greater than maxPrice");
    }

    const providerWhere: Record<string, unknown> = {
      ...where,
      providerStatus: "VERIFIED",
    };

    if (searchKey) {
      providerWhere.OR = [
        {
          businessName: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          services: {
            some: {
              name: {
                contains: searchKey,
                mode: "insensitive",
              },
              isActive: true,
              isHiddenByAdmin: false,
            },
          },
        },
        {
          services: {
            some: {
              category: {
                contains: searchKey,
                mode: "insensitive",
              },
              isActive: true,
              isHiddenByAdmin: false,
            },
          },
        },
      ];
    }

    const serviceWhere: Record<string, unknown> = {
      isActive: true,
      isHiddenByAdmin: false,
    };

    if (typeof category === "string" && category) {
      serviceWhere.category = category;
    }

    const rawProviders = await prisma.providers.findMany({
      where: providerWhere,
      include: {
        services: {
          where: serviceWhere,
        },
        reviews: {
          where: { isHiddenByAdmin: false },
        },
        workingHours: true,
      },
      orderBy: { createAt: "desc" },
    });

    const filteredProviders = rawProviders
      .map((provider) => {
        const totalReviews = provider.reviews.length;
        const averageRating =
          totalReviews > 0
            ? provider.reviews.reduce((acc, r) => acc + r.rating, 0) /
              totalReviews
            : 0;

        const servicePrices = provider.services.map((s) => s.price);
        const minServicePrice =
          servicePrices.length > 0 ? Math.min(...servicePrices) : 0;
        const maxServicePrice =
          servicePrices.length > 0 ? Math.max(...servicePrices) : 0;

        return {
          provider,
          ratingAverage: Math.round(averageRating * 10) / 10,
          totalReviews,
          servicePriceMin: minServicePrice,
          servicePriceMax: maxServicePrice,
        };
      })
      .filter(
        ({ ratingAverage, servicePriceMin, servicePriceMax, totalReviews }) => {
          const matchesRating =
            (minRating === undefined || ratingAverage >= minRating) &&
            (maxRating === undefined || ratingAverage <= maxRating);

          const matchesPrice =
            (minPrice === undefined || servicePriceMin >= minPrice) &&
            (maxPrice === undefined || servicePriceMax <= maxPrice);

          const matchesReviewCount =
            minRating !== undefined || maxRating !== undefined
              ? totalReviews > 0
              : true;

          return matchesRating && matchesPrice && matchesReviewCount;
        },
      );

    const totalItems = filteredProviders.length;
    const paginatedProviders = filteredProviders.slice(index, index + pageSize);

    const items = paginatedProviders.map(
      ({
        provider,
        ratingAverage,
        totalReviews,
        servicePriceMin,
        servicePriceMax,
      }) => {
        const uniqueCategories = Array.from(
          new Set(provider.services.map((s) => s.category)),
        );

        let distance = 0;
        if (userLat && userLng && provider.lat && provider.lng) {
          distance = getDistanceKm(
            Number(userLat),
            Number(userLng),
            provider.lat,
            provider.lng,
          );
        }
        const canBookFuture =
          provider.services.length > 0 &&
          provider.workingHours.some((workingHour) => !workingHour.isClosed);

        const availability = checkAvailability(provider.workingHours);

        return {
          id: provider.id,
          slug: provider.slug,
          businessName: provider.businessName,
          description: provider.description || "",
          avatarUrl: provider.avatarUrl || "",
          coverImageUrl: provider.coverImageUrl || "",

          isVerified: provider.providerStatus === "VERIFIED",
          status: provider.providerStatus,

          location: {
            address: provider.address || "",
            ward: provider.ward || "",
            district: provider.district || "",
            province: provider.province || "",
            coordinates: {
              lat: provider.lat || 0,
              lng: provider.lng || 0,
            },
            distanceKm: distance,
          },

          rating: {
            average: ratingAverage,
            totalReviews,
          },

          services: {
            total: provider.services.length,
            categories: uniqueCategories,
            priceRange: {
              min: servicePriceMin,
              max: servicePriceMax,
              currency: "VND",
            },
            preview: provider.services.slice(0, 3).map((s) => ({
              id: s.id,
              name: s.name,
              price: s.price,
              durationMinutes: s.duration,
              thumbnailUrl: s.imageUrls[0] || "",
              description: s.description || undefined,
            })),
          },
          availability: {
            ...availability,
            canBookFuture,
          },

          paymentMethods: {
            online: provider.payOnline,
            cash: provider.payCash,
          },

          createdAt: provider.createAt.toISOString(),
        };
      },
    );

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      items,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  async getReviewsByProviderId(req: Request) {
    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );

    const { providerId } = req.params;
    const _providerId = getQueryString(providerId);

    if (!_providerId) {
      throw new BadRequestException("Provider ID is required");
    }

    if (!ObjectId.isValid(_providerId)) {
      throw new BadRequestException("Invalid provider ID format");
    }

    where.providerId = _providerId;
    where.isHiddenByAdmin = false;

    const [total, reviews] = await Promise.all([
      prisma.reviews.count({ where: where }),
      prisma.reviews.findMany({
        where: where,
        include: {
          customers: {
            include: {
              users: true,
            },
          },
        },
        skip: index,
        take: pageSize,
      }),
    ]);

    if (!total) {
      throw new NotFoundException("Reviews not found");
    }

    const responseReviews = reviews.map((review) => ({
      id: review.id,
      bookingId: review.bookingId,
      rating: review.rating,
      comment: review.comment,
      images: review.images,
      createdAt: review.createAt.toISOString(),
      updatedAt: review.updateAt.toISOString(),
      user: {
        id: review.customers.users.id,
        name: review.customers.users.fullName,
        avatarUrl: review.customers.users.avatar,
      },
    }));

    return { responseReviews, page, pageSize, total };
  },

  async getProviderInfomation(req: Request) {
    const { providerId } = req.params;
    const { userLat, userLng } = req.query;
    const _id = getQueryString(providerId);

    if (!_id) {
      throw new BadRequestException("Provider ID is required");
    }

    if (!ObjectId.isValid(_id)) {
      throw new BadRequestException("Invalid provider ID format");
    }

    const provider = await prisma.providers.findUnique({
      where: { id: _id },
      include: {
        services: {
          where: {
            isActive: true,
            isHiddenByAdmin: false,
          },
        },
        reviews: {
          where: { isHiddenByAdmin: false },
        },
        workingHours: true,
      },
    });

    if (!provider || provider.providerStatus !== "VERIFIED") {
      throw new NotFoundException("Provider not found");
    }

    const servicePrices = provider.services.map((s) => s.price);
    const minPrice = servicePrices.length > 0 ? Math.min(...servicePrices) : 0;
    const maxPrice = servicePrices.length > 0 ? Math.max(...servicePrices) : 0;
    const uniqueCategories = Array.from(
      new Set(provider.services.map((s) => s.category)),
    );

    let distance = 0;
    if (userLat && userLng && provider.lat && provider.lng) {
      distance = getDistanceKm(
        Number(userLat),
        Number(userLng),
        provider.lat,
        provider.lng,
      );
    }

    const availability = checkAvailability(provider.workingHours);
    const canBookFuture =
      provider.services.length > 0 &&
      provider.workingHours.some((workingHour) => !workingHour.isClosed);

    const totalReviews = provider.reviews.length;

    const averageRating =
      totalReviews > 0
        ? provider.reviews.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews
        : 0;

    const providerItem: ProviderItem = {
      id: provider.id,
      slug: provider.slug,
      businessName: provider.businessName,
      description: provider.description || "",
      avatarUrl: provider.avatarUrl || "",
      coverImageUrl: provider.coverImageUrl || "",
      isVerified: provider.providerStatus === "VERIFIED",
      status: provider.providerStatus,
      location: {
        address: provider.address || "",
        ward: provider.ward || "",
        district: provider.district || "",
        province: provider.province || "",
        coordinates: {
          lat: provider.lat || 0,
          lng: provider.lng || 0,
        },
        distanceKm: distance,
      },
      rating: {
        average: averageRating,
        totalReviews,
      },
      services: {
        total: provider.services.length,
        categories: uniqueCategories,
        priceRange: {
          min: minPrice,
          max: maxPrice,
          currency: "VND",
        },
        preview: provider.services.slice(0, 3).map((s) => ({
          id: s.id,
          name: s.name,
          price: s.price,
          durationMinutes: s.duration,
          thumbnailUrl: s.imageUrls[0] || "",
          description: s.description || undefined,
        })),
      },
      availability: {
        ...availability,
        canBookFuture,
      },
      paymentMethods: {
        online: provider.payOnline,
        cash: provider.payCash,
      },
      createdAt: provider.createAt.toISOString(),
    };

    return providerItem;
  },

  async getWallet(req: Request) {
    const userId = getRequesterId(req);

    const provider = await prisma.providers.findUnique({
      where: { userId },
      select: {
        id: true,
        walletBalance: true,
        depositBalance: true,
        depositStatus: true,
      },
    });

    if (!provider) {
      throw new NotFoundException("Provider profile not found");
    }

    return provider;
  },

  async getWalletTransactions(req: Request) {
    const userId = getRequesterId(req);
    const provider = await prisma.providers.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!provider) {
      throw new NotFoundException("Provider profile not found");
    }

    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );
    where.providerId = provider.id;

    if (typeof req.query.type === "string" && req.query.type) {
      where.type = req.query.type;
    }

    const [totalItems, items] = await Promise.all([
      prisma.wallet_transactions.count({ where }),
      prisma.wallet_transactions.findMany({
        where,
        skip: index,
        take: pageSize,
        orderBy: { createAt: "desc" },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      items,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  async getDisputes(req: Request) {
    const userId = getRequesterId(req);
    const { page, pageSize, index } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );
    const status =
      typeof req.query.status === "string" && req.query.status.trim()
        ? req.query.status.trim()
        : undefined;

    const provider = await prisma.providers.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!provider) {
      throw new NotFoundException("Provider profile not found");
    }

    const where = {
      providerId: provider.id,
      ...(status ? { status } : {}),
    };

    const [items, totalItems] = await Promise.all([
      prisma.booking_disputes.findMany({
        where,
        skip: index,
        take: pageSize,
        orderBy: { createAt: "desc" },
        include: {
          booking: {
            select: {
              id: true,
              status: true,
              paymentMethod: true,
              paymentStatus: true,
              totalAmount: true,
              checkedOutAt: true,
              service: { select: { id: true, name: true } },
              customer: {
                select: {
                  id: true,
                  users: {
                    select: {
                      id: true,
                      userName: true,
                      fullName: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.booking_disputes.count({ where }),
    ]);

    return {
      items: items.map(mapDisputeForProvider),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  },

  async getDisputeById(req: Request) {
    const userId = getRequesterId(req);
    const id = getRouteObjectId(req, "id");

    const provider = await prisma.providers.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!provider) {
      throw new NotFoundException("Provider profile not found");
    }

    const dispute = await prisma.booking_disputes.findFirst({
      where: { id, providerId: provider.id },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            paymentMethod: true,
            paymentStatus: true,
            totalAmount: true,
            checkedOutAt: true,
            service: { select: { id: true, name: true } },
            customer: {
              select: {
                id: true,
                users: {
                  select: {
                    id: true,
                    userName: true,
                    fullName: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!dispute) {
      throw new NotFoundException("Dispute not found");
    }

    return mapDisputeForProvider(dispute);
  },

  async respondDispute(req: Request) {
    const userId = getRequesterId(req);
    const id = getRouteObjectId(req, "id");
    const { response, evidence } = req.body as {
      response?: unknown;
      evidence?: unknown;
    };

    if (typeof response !== "string" || !response.trim()) {
      throw new BadRequestException("response is required");
    }

    const parsedEvidence = getEvidence(evidence, "evidence");
    const provider = await prisma.providers.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!provider) {
      throw new NotFoundException("Provider profile not found");
    }

    const dispute = await prisma.booking_disputes.findFirst({
      where: { id, providerId: provider.id },
      select: {
        id: true,
        status: true,
        bookingId: true,
        customerId: true,
      },
    });

    if (!dispute) {
      throw new NotFoundException("Dispute not found");
    }

    if (dispute.status !== "PENDING") {
      throw new BadRequestException("Only PENDING disputes can be responded");
    }

    const updatedDispute = await prisma.booking_disputes.update({
      where: { id: dispute.id },
      data: {
        providerResponse: response.trim(),
        providerEvidence: encodeEvidence(parsedEvidence),
        providerRespondedAt: new Date(),
      },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            paymentMethod: true,
            paymentStatus: true,
            totalAmount: true,
            checkedOutAt: true,
            service: { select: { id: true, name: true } },
            customer: {
              select: {
                id: true,
                users: {
                  select: {
                    id: true,
                    userName: true,
                    fullName: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const [customer, admins] = await Promise.all([
      prisma.customers.findUnique({
        where: { id: dispute.customerId },
        select: { userId: true },
      }),
      prisma.users.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      }),
    ]);

    await notificationService.safeCreateMany([
      ...(customer
        ? [
            {
              userId: customer.userId,
              type: "DISPUTE_PROVIDER_RESPONSE",
              title: "Provider responded to dispute",
              message: "The provider submitted a response to your dispute.",
              data: { bookingId: dispute.bookingId, disputeId: dispute.id },
            },
          ]
        : []),
      ...admins.map((admin) => ({
        userId: admin.id,
        type: "DISPUTE_PROVIDER_RESPONSE",
        title: "Provider responded to dispute",
        message: "A provider submitted evidence for a pending dispute.",
        data: { bookingId: dispute.bookingId, disputeId: dispute.id },
      })),
    ]);

    return mapDisputeForProvider(updatedDispute);
  },

  async createWithdrawal(req: Request) {
    const userId = getRequesterId(req);
    const { amount, reason } = req.body as {
      amount?: unknown;
      reason?: unknown;
    };

    if (typeof amount !== "number" || !Number.isFinite(amount)) {
      throw new BadRequestException("amount must be a valid number");
    }

    const minWithdrawalAmount = await getSystemSettingValue(
      "minWithdrawalAmount",
    );

    if (amount < minWithdrawalAmount) {
      throw new BadRequestException(
        `Minimum withdrawal amount is ${minWithdrawalAmount} VND`,
      );
    }

    if (
      reason !== undefined &&
      (typeof reason !== "string" || !reason.trim())
    ) {
      throw new BadRequestException("reason must be a non-empty string");
    }

    const provider = await prisma.providers.findUnique({
      where: { userId },
      select: {
        id: true,
        providerStatus: true,
        walletBalance: true,
        bankCode: true,
        bankAccountNumber: true,
        bankAccountName: true,
      },
    });

    if (!provider) {
      throw new NotFoundException("Provider profile not found");
    }

    if (provider.providerStatus !== "VERIFIED") {
      throw new BadRequestException("Provider must be VERIFIED to withdraw");
    }

    if (
      !provider.bankCode ||
      !provider.bankAccountNumber ||
      !provider.bankAccountName
    ) {
      throw new BadRequestException("Provider bank account is required");
    }

    const pendingDispute = await prisma.booking_disputes.findFirst({
      where: {
        providerId: provider.id,
        status: "PENDING",
      },
      select: { id: true },
    });

    if (pendingDispute) {
      throw new BadRequestException(
        "Cannot create withdrawal while provider has pending disputes",
      );
    }

    return prisma.$transaction(async (tx) => {
      const debited = await tx.providers.updateMany({
        where: {
          id: provider.id,
          walletBalance: { gte: amount },
        },
        data: {
          walletBalance: { decrement: amount },
        },
      });

      if (debited.count === 0) {
        throw new BadRequestException("Insufficient wallet balance");
      }

      const updatedProvider = await tx.providers.findUnique({
        where: { id: provider.id },
        select: { walletBalance: true },
      });

      if (!updatedProvider) {
        throw new NotFoundException("Provider profile not found");
      }

      const withdrawal = await tx.withdrawal_requests.create({
        data: {
          providerId: provider.id,
          amount,
          bankCode: provider.bankCode,
          bankAccountNumber: provider.bankAccountNumber,
          bankAccountName: provider.bankAccountName,
          reason: typeof reason === "string" ? reason.trim() : null,
          status: "PENDING",
        },
      });

      await tx.wallet_transactions.create({
        data: {
          providerId: provider.id,
          idempotencyKey: `withdrawal:${withdrawal.id}:WITHDRAWAL_HOLD:WALLET`,
          type: "WITHDRAWAL_HOLD",
          balanceType: "WALLET",
          amount: -amount,
          balanceAfter: updatedProvider.walletBalance,
          note: `Withdrawal hold ${withdrawal.id}`,
        },
      });

      return withdrawal;
    });
  },

  async getWithdrawals(req: Request) {
    const userId = getRequesterId(req);
    const provider = await prisma.providers.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!provider) {
      throw new NotFoundException("Provider profile not found");
    }

    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );
    where.providerId = provider.id;

    if (typeof req.query.status === "string" && req.query.status) {
      where.status = req.query.status;
    }

    const [totalItems, items] = await Promise.all([
      prisma.withdrawal_requests.count({ where }),
      prisma.withdrawal_requests.findMany({
        where,
        skip: index,
        take: pageSize,
        orderBy: { requestedAt: "desc" },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      items,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },
};
