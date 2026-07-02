import { buildQueryPrisma } from "../../common/helpers/build-query-prisma.helper.ts";
import prisma from "../../../connect.prisma.ts";
import { Request, Response } from "express";
import { getQueryString } from "../../common/helpers/paramHelper.ts";
import { ServiceDetailResponse } from "../../types/mobile-types/service.types.ts";

export const mobileServiceServices = {
  async getAllServiceByProviderId(req: Request, res: Response) {
    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );
    const { providerId } = req.params;
    where.providerId = providerId;

    const [services, totalItem] = await Promise.all([
      prisma.services.findMany({ where: where, skip: index, take: pageSize }),
      prisma.services.count({ where: where }),
    ]);
    return { data: services, page, pageSize, total: totalItem };
  },

  async getDetailServiceById(req: Request) {
    const { serviceId } = req.params;
    const _id = getQueryString(serviceId);

    const service = await prisma.services.findUnique({
      where: { id: _id },
      include: {
        provider: true,
      },
    });

    const serviceRes: ServiceDetailResponse = {
      id: service?.id || "",
      providerId: service?.providerId || "",
      name: service?.name || "",
      price: service?.price || 0,
      durationMinutes: service?.duration || 0,
      thumbnailUrl: service?.imageUrls[0] || "",
      description: service?.description || "",
      providerName: service?.provider.businessName || "",
      targetPets: service?.targetPets || [],
      benefits: service?.benefits || [],
      gallery: service?.imageUrls || [],
      longDescription: service?.longDescription || "",
    };

    return serviceRes;
  },
};
