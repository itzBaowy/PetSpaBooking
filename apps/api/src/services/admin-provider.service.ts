import { Request } from "express";
import prisma from "../../connect.prisma.ts";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.ts";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../common/helpers/exception.helper.ts";
import { notificationService } from "./notification.service.ts";
import { adminAuditLogService } from "./admin-audit-log.service.ts";

const PENDING_PROVIDER_STATUS = "PENDING_VERIFICATION";
const REQUIRED_DOCUMENT_TYPES = [
  "business_license",
  "id_card_front",
  "id_card_back",
] as const;

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

const ADMIN_DOCUMENT_SELECT = {
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

function getRequesterId(req: Request): string {
  const userId = (req as Request & { user?: { userId?: string } }).user
    ?.userId;
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

async function getProviderOrThrow(providerId: string) {
  const provider = await prisma.providers.findUnique({
    where: { id: providerId },
    select: {
      id: true,
      userId: true,
      businessName: true,
      providerStatus: true,
    },
  });

  if (!provider) throw new NotFoundException("Provider not found");
  return provider;
}

function getMissingRequiredDocuments(
  documents: Array<{ documentType: string; status: string }>,
) {
  const approvedTypes = new Set(
    documents
      .filter((document) => document.status === "APPROVED")
      .map((document) => document.documentType),
  );

  return REQUIRED_DOCUMENT_TYPES.filter((type) => !approvedTypes.has(type));
}

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
  requiredDocumentTypes: REQUIRED_DOCUMENT_TYPES,

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

  async getDocuments(req: Request) {
    const providerId = getRouteParam(req, "id");
    await getProviderOrThrow(providerId);

    const documents = await prisma.provider_documents.findMany({
      where: { providerId },
      select: ADMIN_DOCUMENT_SELECT,
      orderBy: { createAt: "desc" },
    });

    return {
      providerId,
      requiredDocumentTypes: REQUIRED_DOCUMENT_TYPES,
      items: documents,
    };
  },

  async approveDocument(req: Request) {
    const adminId = getRequesterId(req);
    const documentId = getRouteParam(req, "documentId");

    const document = await prisma.provider_documents.findUnique({
      where: { id: documentId },
      include: {
        provider: {
          select: {
            id: true,
            userId: true,
            businessName: true,
            providerStatus: true,
          },
        },
      },
    });

    if (!document) throw new NotFoundException("Provider document not found");
    if (document.status === "APPROVED") {
      throw new BadRequestException("Document is already approved");
    }

    const updatedDocument = await prisma.provider_documents.update({
      where: { id: documentId },
      data: {
        status: "APPROVED",
        adminNote: null,
      },
      select: ADMIN_DOCUMENT_SELECT,
    });

    const providerDocuments = await prisma.provider_documents.findMany({
      where: { providerId: document.providerId },
      select: {
        documentType: true,
        status: true,
      },
    });
    const missingRequiredDocuments =
      getMissingRequiredDocuments(providerDocuments);

    await notificationService.safeCreate({
      userId: document.provider.userId,
      type: "PROVIDER_DOCUMENT_APPROVED",
      title: "Provider document approved",
      message: "One of your provider verification documents has been approved.",
      data: {
        providerId: document.providerId,
        documentId,
        documentType: document.documentType,
      },
    });

    if (
      document.provider.providerStatus !== "VERIFIED" &&
      missingRequiredDocuments.length === 0
    ) {
      await notificationService.safeCreate({
        userId: document.provider.userId,
        type: "PROVIDER_READY_FOR_VERIFICATION",
        title: "Provider verification is ready",
        message:
          "All required provider documents are approved and ready for admin verification.",
        data: {
          providerId: document.providerId,
        },
      });
    }

    await adminAuditLogService.safeLog({
      adminId,
      action: "PROVIDER_DOCUMENT_APPROVE",
      targetType: "PROVIDER_DOCUMENT",
      targetId: documentId,
      metadata: {
        providerId: document.providerId,
        documentType: document.documentType,
        previousStatus: document.status,
        status: "APPROVED",
      },
    });

    return {
      ...updatedDocument,
      providerReadyForVerification: missingRequiredDocuments.length === 0,
      missingRequiredDocuments,
    };
  },

  async rejectDocument(req: Request) {
    const adminId = getRequesterId(req);
    const documentId = getRouteParam(req, "documentId");
    const { reason } = req.body as { reason?: string };

    if (!reason || !reason.trim()) {
      throw new BadRequestException("Rejection reason is required");
    }

    const document = await prisma.provider_documents.findUnique({
      where: { id: documentId },
      include: {
        provider: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!document) throw new NotFoundException("Provider document not found");
    if (document.status === "REJECTED") {
      throw new BadRequestException("Document is already rejected");
    }

    const updatedDocument = await prisma.provider_documents.update({
      where: { id: documentId },
      data: {
        status: "REJECTED",
        adminNote: reason.trim(),
      },
      select: ADMIN_DOCUMENT_SELECT,
    });

    await notificationService.safeCreate({
      userId: document.provider.userId,
      type: "PROVIDER_DOCUMENT_REJECTED",
      title: "Provider document rejected",
      message: "One of your provider verification documents was rejected.",
      data: {
        providerId: document.providerId,
        documentId,
        documentType: document.documentType,
        reason: reason.trim(),
      },
    });

    await adminAuditLogService.safeLog({
      adminId,
      action: "PROVIDER_DOCUMENT_REJECT",
      targetType: "PROVIDER_DOCUMENT",
      targetId: documentId,
      metadata: {
        providerId: document.providerId,
        documentType: document.documentType,
        previousStatus: document.status,
        status: "REJECTED",
        reason: reason.trim(),
      },
    });

    return updatedDocument;
  },
};
