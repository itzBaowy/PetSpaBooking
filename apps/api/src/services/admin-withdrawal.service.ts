import { Request } from "express";
import { ObjectId } from "mongodb";
import prisma from "../../connect.prisma.ts";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.ts";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../common/helpers/exception.helper.ts";

const WITHDRAWAL_STATUSES = ["PENDING", "APPROVED", "REJECTED", "PAID"] as const;
type WithdrawalStatus = (typeof WITHDRAWAL_STATUSES)[number];

const WITHDRAWAL_INCLUDE = {
  provider: {
    select: {
      id: true,
      businessName: true,
      providerStatus: true,
      walletBalance: true,
      bankCode: true,
      bankAccountNumber: true,
      bankAccountName: true,
    },
  },
} as const;

function getRequesterId(req: Request): string {
  const userId = (req as Request & { user?: { userId?: string } }).user
    ?.userId;
  if (!userId) throw new UnauthorizedException("Unauthorized");
  return userId;
}

function getRouteParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string" || !ObjectId.isValid(value)) {
    throw new BadRequestException(`Invalid route parameter: ${name}`);
  }

  return value;
}

function getStatus(value: unknown): WithdrawalStatus | undefined {
  if (value === undefined) return undefined;
  if (
    typeof value !== "string" ||
    !WITHDRAWAL_STATUSES.includes(value as WithdrawalStatus)
  ) {
    throw new BadRequestException(
      `status must be one of: ${WITHDRAWAL_STATUSES.join(", ")}`,
    );
  }

  return value as WithdrawalStatus;
}

function getOptionalAdminNote(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestException("adminNote must be a non-empty string");
  }

  return value.trim();
}

export const adminWithdrawalService = {
  async getAll(req: Request) {
    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );
    const status = getStatus(req.query.status);

    if (status) where.status = status;

    const [totalItems, items] = await Promise.all([
      prisma.withdrawal_requests.count({ where }),
      prisma.withdrawal_requests.findMany({
        where,
        include: WITHDRAWAL_INCLUDE,
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

  async getById(req: Request) {
    const id = getRouteParam(req, "id");
    const withdrawal = await prisma.withdrawal_requests.findUnique({
      where: { id },
      include: WITHDRAWAL_INCLUDE,
    });

    if (!withdrawal) {
      throw new NotFoundException("Withdrawal request not found");
    }

    return withdrawal;
  },

  async approve(req: Request) {
    const adminId = getRequesterId(req);
    const id = getRouteParam(req, "id");
    const adminNote = getOptionalAdminNote(req.body?.adminNote);

    const updated = await prisma.withdrawal_requests.updateMany({
      where: { id, status: "PENDING" },
      data: {
        status: "APPROVED",
        reviewedBy: adminId,
        reviewedAt: new Date(),
        adminNote,
      },
    });

    if (updated.count === 0) {
      const exists = await prisma.withdrawal_requests.findUnique({ where: { id } });
      if (!exists) throw new NotFoundException("Withdrawal request not found");
      throw new BadRequestException("Only PENDING withdrawals can be approved");
    }

    return this.getById(req);
  },

  async reject(req: Request) {
    const adminId = getRequesterId(req);
    const id = getRouteParam(req, "id");
    const adminNote = getOptionalAdminNote(req.body?.adminNote);

    if (!adminNote) {
      throw new BadRequestException("adminNote is required when rejecting");
    }

    const updated = await prisma.withdrawal_requests.updateMany({
      where: { id, status: "PENDING" },
      data: {
        status: "REJECTED",
        reviewedBy: adminId,
        reviewedAt: new Date(),
        adminNote,
      },
    });

    if (updated.count === 0) {
      const exists = await prisma.withdrawal_requests.findUnique({ where: { id } });
      if (!exists) throw new NotFoundException("Withdrawal request not found");
      throw new BadRequestException("Only PENDING withdrawals can be rejected");
    }

    return this.getById(req);
  },

  async markPaid(req: Request) {
    const adminId = getRequesterId(req);
    const id = getRouteParam(req, "id");
    const adminNote = getOptionalAdminNote(req.body?.adminNote);
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawal_requests.findUnique({
        where: { id },
        include: WITHDRAWAL_INCLUDE,
      });

      if (!withdrawal) {
        throw new NotFoundException("Withdrawal request not found");
      }

      if (withdrawal.status !== "APPROVED") {
        throw new BadRequestException("Only APPROVED withdrawals can be marked paid");
      }

      if (withdrawal.provider.walletBalance < withdrawal.amount) {
        throw new BadRequestException("Provider wallet balance is insufficient");
      }

      const claimed = await tx.withdrawal_requests.updateMany({
        where: { id, status: "APPROVED" },
        data: {
          status: "PAID",
          reviewedBy: withdrawal.reviewedBy ?? adminId,
          reviewedAt: withdrawal.reviewedAt ?? now,
          paidAt: now,
          adminNote: adminNote ?? withdrawal.adminNote,
        },
      });

      if (claimed.count === 0) {
        throw new BadRequestException("Withdrawal request was already processed");
      }

      const updatedProvider = await tx.providers.update({
        where: { id: withdrawal.providerId },
        data: {
          walletBalance: { decrement: withdrawal.amount },
        },
        select: {
          id: true,
          walletBalance: true,
        },
      });

      await tx.wallet_transactions.create({
        data: {
          providerId: withdrawal.providerId,
          type: "WITHDRAWAL_PAYOUT",
          balanceType: "WALLET",
          amount: -withdrawal.amount,
          balanceAfter: updatedProvider.walletBalance,
          note: `Withdrawal payout ${withdrawal.id}`,
        },
      });

      return tx.withdrawal_requests.findUnique({
        where: { id },
        include: WITHDRAWAL_INCLUDE,
      });
    });
  },
};
