//Service dành riêng cho mobile

import { Request } from "express";
import { buildQueryPrisma } from "../../common/helpers/build-query-prisma.helper.ts";
import prisma from "../../../connect.prisma.ts";
import {
  checkAvailability,
  getDistanceKm,
} from "../../common/helpers/provider.helper.ts";
import { getQueryString } from "../../common/helpers/paramHelper.ts";
import { ProviderItem } from "../../types/mobile-types/provider.types.ts";
import {
  BadRequestException,
  NotFoundException,
} from "../../common/helpers/exception.helper.ts";
import { ObjectId } from "mongodb";

export const mobileProviderServices = {
  async getAllProviders(req: Request) {
    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );

    const { userLat, userLng } = req.query;

    where.isActive = true;
    where.isHiddenByAdmin = false;

    const rawProviders = await prisma.providers.findMany({
      include: {
        services: {
          where: where,
        },
        reviews: true,
        workingHours: true,
      },
      skip: index,
      take: pageSize,
    });

    return rawProviders.map((provider) => {
      const totalReviews = provider.reviews.length;
      const averageRating =
        totalReviews > 0
          ? provider.reviews.reduce((acc, r) => acc + r.rating, 0) /
            totalReviews
          : 0;

      const servicePrices = provider.services.map((s) => s.price);
      const minPrice =
        servicePrices.length > 0 ? Math.min(...servicePrices) : 0;
      const maxPrice =
        servicePrices.length > 0 ? Math.max(...servicePrices) : 0;
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

      return {
        page,
        pageSize,
        items: {
          id: provider.id,
          slug: provider.slug,
          businessName: provider.businessName,
          description: provider.description || "",
          avatarUrl: provider.avatarUrl || "",
          coverImageUrl: provider.coverImageUrl || "",

          isVerified: provider.providerStatus === "APPROVED",
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
            average: Math.round(averageRating * 10) / 10,
            totalReviews: totalReviews,
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

          availability: availability,

          paymentMethods: {
            online: provider.payOnline,
            cash: provider.payCash,
          },

          createdAt: provider.createAt.toISOString(),
        },
      };
    });
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
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createAt.toISOString(),
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
        services: true,
        reviews: true,
        workingHours: true,
      },
    });

    if (!provider) {
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
      isVerified: provider.providerStatus === "APPROVED",
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
        totalReviews: provider.reviews.length,
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
      availability: availability,
      paymentMethods: {
        online: provider.payOnline,
        cash: provider.payCash,
      },
      createdAt: provider.createAt.toISOString(),
    };

    return providerItem;
  },
};
