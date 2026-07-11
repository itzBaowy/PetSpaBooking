import { Request } from "express";
import prisma from "../../connect.prisma.ts";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.ts";

const PENDING_PROVIDER_STATUS = "PENDING_VERIFICATION";

const ADMIN_PROVIDER_SELECT = {
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
  ward: true,
  district: true,
  province: true,
  taxCode: true,
  identityNumber: true,
  identityFullName: true,
  identityDob: true,
  identityAddress: true,
  providerStatus: true,
  depositStatus: true,
  depositBalance: true,
  walletBalance: true,
  adminNote: true,
  createAt: true,
  updateAt: true,
} as const;

async function attachDocumentSummary<T extends { id: string }>(providers: T[]) {
  const providerIds = providers.map((provider) => provider.id);

  if (providerIds.length === 0) {
    return providers.map((provider) => ({
      ...provider,
      documentSummary: {
        total: 0,
        pending: 0,
      },
    }));
  }

  const documentGroups = await prisma.provider_documents.groupBy({
    by: ["providerId", "status"],
    where: {
      providerId: { in: providerIds },
    },
    _count: { _all: true },
  });

  const summaryByProvider = new Map<string, { total: number; pending: number }>();

  for (const group of documentGroups) {
    const summary =
      summaryByProvider.get(group.providerId) ?? { total: 0, pending: 0 };
    summary.total += group._count._all;
    if (group.status === "PENDING") {
      summary.pending += group._count._all;
    }
    summaryByProvider.set(group.providerId, summary);
  }

  return providers.map((provider) => ({
    ...provider,
    documentSummary: summaryByProvider.get(provider.id) ?? {
      total: 0,
      pending: 0,
    },
  }));
}

export const adminProviderService = {
  async getPending(req: Request) {
    const { page, pageSize, where, index } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );

    where.providerStatus = PENDING_PROVIDER_STATUS;

    const [totalItems, providers] = await Promise.all([
      prisma.providers.count({ where }),
      prisma.providers.findMany({
        where,
        select: ADMIN_PROVIDER_SELECT,
        orderBy: { createAt: "desc" },
        skip: index,
        take: pageSize,
      }),
    ]);

    const items = await attachDocumentSummary(providers);

    return {
      items,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  },
};
