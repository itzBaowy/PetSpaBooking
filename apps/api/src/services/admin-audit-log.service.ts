import { Request } from "express";
import { ObjectId } from "mongodb";
import prisma from "../../connect.prisma.ts";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.ts";
import { BadRequestException } from "../common/helpers/exception.helper.ts";

type AuditLogInput = {
  adminId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
};

function encodeMetadata(metadata?: Record<string, unknown> | null) {
  return metadata ? JSON.stringify(metadata) : null;
}

function decodeMetadata<T extends { metadata: string | null }>(log: T) {
  return {
    ...log,
    metadata: log.metadata ? JSON.parse(log.metadata) : null,
  };
}

function getObjectIdQuery(value: unknown, name: string) {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !ObjectId.isValid(value)) {
    throw new BadRequestException(`${name} must be a valid ObjectId`);
  }

  return value;
}

function getDateQuery(value: unknown, name: string) {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new BadRequestException(`${name} must be a valid date`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`${name} must be a valid date`);
  }

  return date;
}

export const adminAuditLogService = {
  async log(input: AuditLogInput) {
    return prisma.admin_audit_logs.create({
      data: {
        adminId: input.adminId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId ?? null,
        metadata: encodeMetadata(input.metadata),
      },
    });
  },

  async safeLog(input: AuditLogInput) {
    try {
      return await this.log(input);
    } catch (error) {
      console.error("[admin-audit-log] log failed:", error);
      return null;
    }
  },

  async getAll(req: Request) {
    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );
    const adminId = getObjectIdQuery(req.query.adminId, "adminId");
    const targetId =
      typeof req.query.targetId === "string" && req.query.targetId
        ? req.query.targetId
        : undefined;
    const from = getDateQuery(req.query.from, "from");
    const to = getDateQuery(req.query.to, "to");

    if (adminId) where.adminId = adminId;
    if (typeof req.query.action === "string" && req.query.action) {
      where.action = req.query.action;
    }
    if (typeof req.query.targetType === "string" && req.query.targetType) {
      where.targetType = req.query.targetType;
    }
    if (targetId) where.targetId = targetId;
    if (from || to) {
      where.createAt = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }

    const [totalItems, items] = await Promise.all([
      prisma.admin_audit_logs.count({ where }),
      prisma.admin_audit_logs.findMany({
        where,
        skip: index,
        take: pageSize,
        orderBy: { createAt: "desc" },
        include: {
          admin: {
            select: {
              id: true,
              userName: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      items: items.map(decodeMetadata),
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
