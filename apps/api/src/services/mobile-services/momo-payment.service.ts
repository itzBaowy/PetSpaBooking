import crypto from "node:crypto";
import { Request } from "express";
import { ObjectId } from "mongodb";
import prisma from "../../../connect.prisma.ts";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "../../common/helpers/exception.helper.ts";
import { notificationService } from "../notification.service.ts";
import { socketService } from "../socket.service.ts";
import { getSystemSettingValue } from "../system-setting.service.ts";

const MOMO_PROVIDER = "MOMO";
const MOMO_PAYMENT_TYPE_BOOKING = "BOOKING";
const MOMO_PAYMENT_TYPE_PROVIDER_DEPOSIT = "PROVIDER_DEPOSIT";
const MOMO_DEFAULT_REQUEST_TYPE = "payWithMethod";
const MOMO_WALLET_MIN_AMOUNT = 1_000;
const MOMO_PAY_WITH_METHOD_MIN_AMOUNT = 10_000;
const MOMO_DEFAULT_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create";
const MOMO_FETCH_TIMEOUT_MS = 30_000;
const MOMO_REQUEST_TYPES = ["captureWallet", "payWithMethod"] as const;

type MomoRequestType = (typeof MOMO_REQUEST_TYPES)[number];

type MomoCreateResponse = {
  partnerCode?: string;
  orderId?: string;
  requestId?: string;
  amount?: number;
  responseTime?: number;
  message?: string;
  resultCode?: number;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
};

type MomoQueryResponse = MomoCreateResponse & {
  orderInfo?: string;
  orderType?: string;
  payType?: string;
  transId?: string | number;
  signature?: string;
};

type PaymentRecord = {
  id: string;
  type: string;
  bookingId: string | null;
  customerId: string | null;
  providerId: string;
  amount: number;
  status: string;
  paidAt: Date | null;
};

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

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new BadRequestException(`Missing MoMo config: ${name}`);
  }

  return value;
}

function getMomoEndpoint() {
  return process.env.MOMO_ENDPOINT || MOMO_DEFAULT_ENDPOINT;
}

function getMomoQueryEndpoint() {
  return (
    process.env.MOMO_QUERY_ENDPOINT ||
    getMomoEndpoint().replace(/\/create$/, "/query")
  );
}

function getMomoRequestType(): MomoRequestType {
  const requestType = process.env.MOMO_REQUEST_TYPE || MOMO_DEFAULT_REQUEST_TYPE;
  if (!MOMO_REQUEST_TYPES.includes(requestType as MomoRequestType)) {
    throw new BadRequestException(
      `MOMO_REQUEST_TYPE must be one of: ${MOMO_REQUEST_TYPES.join(", ")}`,
    );
  }

  return requestType as MomoRequestType;
}

function getMomoMinAmount(requestType: MomoRequestType) {
  return requestType === "payWithMethod"
    ? MOMO_PAY_WITH_METHOD_MIN_AMOUNT
    : MOMO_WALLET_MIN_AMOUNT;
}

function getDepositStatusAfterTopUp(
  depositBalance: number,
  minProviderDeposit: number,
) {
  return depositBalance >= minProviderDeposit ? "ACTIVE" : "LOW_BALANCE";
}

function hmacSha256(rawSignature: string, secretKey: string) {
  return crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");
}

function buildCreateSignature(input: {
  accessKey: string;
  amount: number;
  extraData: string;
  ipnUrl: string;
  orderId: string;
  orderInfo: string;
  partnerCode: string;
  redirectUrl: string;
  requestId: string;
  requestType: string;
}) {
  return [
    `accessKey=${input.accessKey}`,
    `amount=${input.amount}`,
    `extraData=${input.extraData}`,
    `ipnUrl=${input.ipnUrl}`,
    `orderId=${input.orderId}`,
    `orderInfo=${input.orderInfo}`,
    `partnerCode=${input.partnerCode}`,
    `redirectUrl=${input.redirectUrl}`,
    `requestId=${input.requestId}`,
    `requestType=${input.requestType}`,
  ].join("&");
}

function buildResultSignature(input: Record<string, unknown>, accessKey: string) {
  return [
    `accessKey=${accessKey}`,
    `amount=${input.amount ?? ""}`,
    `extraData=${input.extraData ?? ""}`,
    `message=${input.message ?? ""}`,
    `orderId=${input.orderId ?? ""}`,
    `orderInfo=${input.orderInfo ?? ""}`,
    `orderType=${input.orderType ?? ""}`,
    `partnerCode=${input.partnerCode ?? ""}`,
    `payType=${input.payType ?? ""}`,
    `requestId=${input.requestId ?? ""}`,
    `responseTime=${input.responseTime ?? ""}`,
    `resultCode=${input.resultCode ?? ""}`,
    `transId=${input.transId ?? ""}`,
  ].join("&");
}

function buildQuerySignature(input: {
  accessKey: string;
  orderId: string;
  partnerCode: string;
  requestId: string;
}) {
  return [
    `accessKey=${input.accessKey}`,
    `orderId=${input.orderId}`,
    `partnerCode=${input.partnerCode}`,
    `requestId=${input.requestId}`,
  ].join("&");
}

function verifyMomoResultSignature(payload: Record<string, unknown>) {
  const receivedSignature = payload.signature;
  if (typeof receivedSignature !== "string" || !receivedSignature) {
    throw new BadRequestException("Missing MoMo signature");
  }

  const accessKey = getRequiredEnv("MOMO_ACCESS_KEY");
  const secretKey = getRequiredEnv("MOMO_SECRET_KEY");
  const expectedSignature = hmacSha256(
    buildResultSignature(payload, accessKey),
    secretKey,
  );

  if (expectedSignature !== receivedSignature) {
    throw new BadRequestException("Invalid MoMo signature");
  }
}

function encodeExtraData(data: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(data)).toString("base64");
}

async function fetchMomoCreatePayment(body: Record<string, unknown>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MOMO_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(getMomoEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const json = (await response.json()) as MomoCreateResponse;
    if (!response.ok) {
      throw new BadRequestException(
        json.message || "MoMo create payment request failed",
      );
    }

    return json;
  } catch (error) {
    if (error instanceof BadRequestException) throw error;
    throw new BadRequestException("MoMo create payment request failed");
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchMomoQueryPayment(orderId: string) {
  const partnerCode = getRequiredEnv("MOMO_PARTNER_CODE");
  const accessKey = getRequiredEnv("MOMO_ACCESS_KEY");
  const secretKey = getRequiredEnv("MOMO_SECRET_KEY");
  const requestId = crypto.randomUUID();
  const signature = hmacSha256(
    buildQuerySignature({
      accessKey,
      orderId,
      partnerCode,
      requestId,
    }),
    secretKey,
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MOMO_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(getMomoQueryEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        partnerCode,
        requestId,
        orderId,
        lang: "vi",
        signature,
      }),
      signal: controller.signal,
    });

    const json = (await response.json()) as MomoQueryResponse;
    if (!response.ok) {
      throw new BadRequestException(
        json.message || "MoMo query payment request failed",
      );
    }

    return json;
  } catch (error) {
    if (error instanceof BadRequestException) throw error;
    throw new BadRequestException("MoMo query payment request failed");
  } finally {
    clearTimeout(timeout);
  }
}

async function getCustomerByUser(userId: string) {
  const customer = await prisma.customers.findUnique({ where: { userId } });
  if (!customer) throw new ForbiddenException("Customer profile not found");
  return customer;
}

async function getProviderByUser(userId: string) {
  const provider = await prisma.providers.findUnique({ where: { userId } });
  if (!provider) throw new ForbiddenException("Provider profile not found");
  return provider;
}

function getAmount(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new BadRequestException("amount must be a valid number");
  }

  return Math.round(value);
}

async function createMomoRequest(input: {
  amount: number;
  orderId: string;
  orderInfo: string;
  extraData: string;
  redirectUrl: string;
  ipnUrl: string;
}) {
  const requestType = getMomoRequestType();
  const minAmount = getMomoMinAmount(requestType);
  if (input.amount < minAmount) {
    throw new BadRequestException(
      `MoMo ${requestType} amount must be at least ${minAmount} VND`,
    );
  }

  const partnerCode = getRequiredEnv("MOMO_PARTNER_CODE");
  const accessKey = getRequiredEnv("MOMO_ACCESS_KEY");
  const secretKey = getRequiredEnv("MOMO_SECRET_KEY");
  const partnerName = process.env.MOMO_PARTNER_NAME || "PetLink";
  const storeId = process.env.MOMO_STORE_ID || "PetLink";
  const requestId = crypto.randomUUID();

  const rawSignature = buildCreateSignature({
    accessKey,
    amount: input.amount,
    extraData: input.extraData,
    ipnUrl: input.ipnUrl,
    orderId: input.orderId,
    orderInfo: input.orderInfo,
    partnerCode,
    redirectUrl: input.redirectUrl,
    requestId,
    requestType,
  });

  const signature = hmacSha256(rawSignature, secretKey);
  const requestBody = {
    partnerCode,
    partnerName,
    storeId,
    requestId,
    amount: input.amount,
    orderId: input.orderId,
    orderInfo: input.orderInfo,
    redirectUrl: input.redirectUrl,
    ipnUrl: input.ipnUrl,
    lang: "vi",
    requestType,
    extraData: input.extraData,
    signature,
  };

  const momoResponse = await fetchMomoCreatePayment(requestBody);

  return {
    requestId,
    requestType,
    momoResponse,
  };
}

async function applyPaymentResult(
  payment: PaymentRecord,
  payload: Record<string, unknown>,
  raw: string,
  options: { markNonSuccessFailed?: boolean } = {},
) {
  const orderId = String(payload.orderId ?? "");
  const resultCode = Number(payload.resultCode);
  const message = typeof payload.message === "string" ? payload.message : null;
  const transId = payload.transId !== undefined ? String(payload.transId) : null;

  const isSuccess = resultCode === 0;
  const now = new Date();
  const markNonSuccessFailed = options.markNonSuccessFailed ?? true;

  const updatedPayment = await prisma.$transaction(async (tx) => {
    const claimed = await tx.payment_transactions.updateMany({
      where: {
        id: payment.id,
        ...(isSuccess ? { status: { not: "SUCCESS" } } : {}),
      },
      data: {
        status: isSuccess ? "SUCCESS" : markNonSuccessFailed ? "FAILED" : payment.status,
        resultCode: Number.isFinite(resultCode) ? resultCode : null,
        message,
        transId,
        rawIpn: raw,
        paidAt: isSuccess ? now : payment.paidAt,
      },
    });

    const updated = await tx.payment_transactions.findUnique({
      where: { id: payment.id },
    });

    if (!updated) {
      throw new NotFoundException("Payment transaction not found");
    }

    const didClaimSuccess = isSuccess && claimed.count > 0;

    if (didClaimSuccess && payment.type === MOMO_PAYMENT_TYPE_BOOKING && payment.bookingId) {
      await tx.bookings.updateMany({
        where: {
          id: payment.bookingId,
          paymentMethod: "ONLINE",
          paymentStatus: { not: "SUCCESS" },
        },
        data: {
          paymentStatus: "SUCCESS",
          paymentReference: transId ?? orderId,
          paidAt: now,
        },
      });
    }

    if (
      didClaimSuccess &&
      payment.type === MOMO_PAYMENT_TYPE_PROVIDER_DEPOSIT
    ) {
      const minProviderDeposit = await getSystemSettingValue("minProviderDeposit");
      const provider = await tx.providers.findUnique({
        where: { id: payment.providerId },
        select: { depositBalance: true },
      });

      if (!provider) {
        throw new NotFoundException("Provider not found");
      }

      const balanceAfter = provider.depositBalance + payment.amount;
      const updatedProvider = await tx.providers.update({
        where: { id: payment.providerId },
        data: {
          depositBalance: { increment: payment.amount },
          depositStatus: getDepositStatusAfterTopUp(
            balanceAfter,
            minProviderDeposit,
          ),
        },
        select: {
          depositBalance: true,
          depositStatus: true,
        },
      });

      await tx.wallet_transactions.create({
        data: {
          providerId: payment.providerId,
          idempotencyKey: `deposit-top-up:${payment.id}`,
          type: "DEPOSIT_TOP_UP",
          balanceType: "DEPOSIT",
          amount: payment.amount,
          balanceAfter: updatedProvider.depositBalance,
          note: `MoMo provider deposit top-up ${orderId}`,
        },
      });
    }

    return updated;
  });

  if (isSuccess && payment.type === MOMO_PAYMENT_TYPE_BOOKING && payment.bookingId) {
    const booking = await prisma.bookings.findUnique({
      where: { id: payment.bookingId },
      include: {
        customer: {
          include: {
            users: true,
          },
        },
        provider: true,
      },
    });

    if (booking) {
      const socketPayload = {
        bookingId: booking.id,
        paymentStatus: booking.paymentStatus,
        paymentReference: transId ?? orderId,
        orderId,
        transId,
      };
      socketService.emitToUser(booking.customer.users.id, "payment:updated", socketPayload);
      socketService.emitToProvider(booking.provider.id, "payment:updated", socketPayload);
      socketService.emitToBooking(booking.id, "payment:updated", socketPayload);
      socketService.emitToUser(booking.customer.users.id, "booking:updated", {
        booking,
      });
      socketService.emitToProvider(booking.provider.id, "booking:updated", {
        booking,
      });
      socketService.emitToBooking(booking.id, "booking:updated", { booking });

      await notificationService.safeCreateMany([
        {
          userId: booking.customer.users.id,
          type: "PAYMENT_SUCCESS",
          title: "Payment successful",
          message: "Your MoMo payment was completed successfully.",
          data: {
            bookingId: booking.id,
            orderId,
            transId,
          },
        },
        {
          userId: booking.provider.userId,
          type: "BOOKING_ONLINE_PAID",
          title: "Booking paid online",
          message: "A customer has paid for a booking via MoMo.",
          data: {
            bookingId: booking.id,
            orderId,
            transId,
          },
        },
      ]);
    }
  }

  if (isSuccess && payment.type === MOMO_PAYMENT_TYPE_PROVIDER_DEPOSIT) {
    const provider = await prisma.providers.findUnique({
      where: { id: payment.providerId },
      select: {
        id: true,
        userId: true,
        businessName: true,
        depositBalance: true,
        depositStatus: true,
      },
    });

    if (provider) {
      const socketPayload = {
        providerId: provider.id,
        paymentStatus: updatedPayment.status,
        depositBalance: provider.depositBalance,
        depositStatus: provider.depositStatus,
        orderId,
        transId,
      };
      socketService.emitToUser(provider.userId, "payment:updated", socketPayload);
      socketService.emitToProvider(provider.id, "payment:updated", socketPayload);
      socketService.emitToProvider(provider.id, "provider:deposit:updated", socketPayload);

      await notificationService.safeCreate({
        userId: provider.userId,
        type: "PROVIDER_DEPOSIT_TOP_UP",
        title: "Deposit top-up successful",
        message: "Your provider deposit top-up was completed successfully.",
        data: {
          providerId: provider.id,
          orderId,
          transId,
          depositBalance: provider.depositBalance,
          depositStatus: provider.depositStatus,
        },
      });
    }
  }

  return updatedPayment;
}

async function markPaymentResult(payload: Record<string, unknown>, raw: string) {
  verifyMomoResultSignature(payload);

  const orderId = String(payload.orderId ?? "");
  const requestId = String(payload.requestId ?? "");

  if (!orderId || !requestId) {
    throw new BadRequestException("Missing MoMo orderId or requestId");
  }

  const payment = await prisma.payment_transactions.findFirst({
    where: {
      orderId,
      requestId,
    },
  });

  if (!payment) {
    throw new NotFoundException("Payment transaction not found");
  }

  return applyPaymentResult(payment, payload, raw);
}

export const momoPaymentService = {
  async createPayment(req: Request) {
    const userId = getRequesterId(req);
    const bookingId = getRouteParam(req, "id");
    const customer = await getCustomerByUser(userId);

    const booking = await prisma.bookings.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        provider: true,
      },
    });

    if (!booking || booking.customerId !== customer.id) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.paymentMethod !== "ONLINE") {
      throw new BadRequestException("Booking paymentMethod must be ONLINE");
    }

    if (booking.paymentStatus === "SUCCESS") {
      throw new BadRequestException("Booking has already been paid");
    }

    if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
      throw new BadRequestException(
        "Only PENDING or CONFIRMED bookings can be paid online",
      );
    }

    const amount = Math.round(booking.totalAmount);
    const redirectUrl = getRequiredEnv("MOMO_REDIRECT_URL");
    const ipnUrl = getRequiredEnv("MOMO_IPN_URL");

    const existingPayment = await prisma.payment_transactions.findFirst({
      where: {
        bookingId: booking.id,
        provider: MOMO_PROVIDER,
        type: MOMO_PAYMENT_TYPE_BOOKING,
        status: "PENDING",
        payUrl: { not: null },
      },
      orderBy: { createAt: "desc" },
    });

    if (existingPayment?.payUrl) {
      return {
        bookingId: booking.id,
        orderId: existingPayment.orderId,
        requestId: existingPayment.requestId,
        amount: existingPayment.amount,
        payUrl: existingPayment.payUrl,
        deeplink: existingPayment.deeplink,
        qrCodeUrl: existingPayment.qrCodeUrl,
        status: existingPayment.status,
      };
    }

    const orderId = `booking-${booking.id}-${Date.now()}`;
    const orderInfo = `PetLink booking ${booking.id}`;
    const extraData = encodeExtraData({
      type: MOMO_PAYMENT_TYPE_BOOKING,
      bookingId: booking.id,
      customerId: booking.customerId,
      providerId: booking.providerId,
    });

    const { requestId, momoResponse } = await createMomoRequest({
      amount,
      orderId,
      orderInfo,
      extraData,
      redirectUrl,
      ipnUrl,
    });

    const payment = await prisma.payment_transactions.create({
      data: {
        type: MOMO_PAYMENT_TYPE_BOOKING,
        bookingId: booking.id,
        customerId: booking.customerId,
        providerId: booking.providerId,
        provider: MOMO_PROVIDER,
        orderId,
        requestId,
        amount,
        status: momoResponse.resultCode === 0 ? "PENDING" : "FAILED",
        payUrl: momoResponse.payUrl ?? null,
        deeplink: momoResponse.deeplink ?? null,
        qrCodeUrl: momoResponse.qrCodeUrl ?? null,
        resultCode: momoResponse.resultCode ?? null,
        message: momoResponse.message ?? null,
        rawResponse: JSON.stringify(momoResponse),
      },
    });

    if (!payment.payUrl && payment.status === "FAILED") {
      throw new BadRequestException(payment.message || "MoMo payment creation failed");
    }

    return {
      bookingId: booking.id,
      orderId: payment.orderId,
      requestId: payment.requestId,
      amount: payment.amount,
      payUrl: payment.payUrl,
      deeplink: payment.deeplink,
      qrCodeUrl: payment.qrCodeUrl,
      status: payment.status,
    };
  },

  async createProviderDepositPayment(req: Request) {
    const userId = getRequesterId(req);
    const provider = await getProviderByUser(userId);
    const amount = getAmount(req.body?.amount);
    const requestType = getMomoRequestType();
    const minAmount = Math.max(
      getMomoMinAmount(requestType),
      await getSystemSettingValue("minProviderDeposit"),
    );

    if (provider.providerStatus !== "VERIFIED") {
      throw new ForbiddenException(
        "Provider must be VERIFIED before topping up deposit",
      );
    }

    if (amount < minAmount) {
      throw new BadRequestException(
        `Provider deposit top-up amount must be at least ${minAmount} VND`,
      );
    }

    const redirectUrl =
      process.env.MOMO_PROVIDER_DEPOSIT_REDIRECT_URL ||
      getRequiredEnv("MOMO_REDIRECT_URL");
    const ipnUrl =
      process.env.MOMO_PROVIDER_DEPOSIT_IPN_URL ||
      getRequiredEnv("MOMO_IPN_URL");

    const orderId = `provider-deposit-${provider.id}-${Date.now()}`;
    const orderInfo = `PetLink provider deposit ${provider.id}`;
    const extraData = encodeExtraData({
      type: MOMO_PAYMENT_TYPE_PROVIDER_DEPOSIT,
      providerId: provider.id,
      userId,
    });

    const { requestId, momoResponse } = await createMomoRequest({
      amount,
      orderId,
      orderInfo,
      extraData,
      redirectUrl,
      ipnUrl,
    });

    const payment = await prisma.payment_transactions.create({
      data: {
        type: MOMO_PAYMENT_TYPE_PROVIDER_DEPOSIT,
        bookingId: null,
        customerId: null,
        providerId: provider.id,
        provider: MOMO_PROVIDER,
        orderId,
        requestId,
        amount,
        status: momoResponse.resultCode === 0 ? "PENDING" : "FAILED",
        payUrl: momoResponse.payUrl ?? null,
        deeplink: momoResponse.deeplink ?? null,
        qrCodeUrl: momoResponse.qrCodeUrl ?? null,
        resultCode: momoResponse.resultCode ?? null,
        message: momoResponse.message ?? null,
        rawResponse: JSON.stringify(momoResponse),
      },
    });

    if (!payment.payUrl && payment.status === "FAILED") {
      throw new BadRequestException(
        payment.message || "MoMo deposit payment creation failed",
      );
    }

    return {
      providerId: provider.id,
      orderId: payment.orderId,
      requestId: payment.requestId,
      amount: payment.amount,
      payUrl: payment.payUrl,
      deeplink: payment.deeplink,
      qrCodeUrl: payment.qrCodeUrl,
      status: payment.status,
    };
  },

  async syncProviderDepositPayment(req: Request) {
    const userId = getRequesterId(req);
    const provider = await getProviderByUser(userId);
    const rawOrderId = req.body?.orderId;

    if (
      rawOrderId !== undefined &&
      (typeof rawOrderId !== "string" || !rawOrderId.trim())
    ) {
      throw new BadRequestException("orderId must be a non-empty string");
    }

    const payment = await prisma.payment_transactions.findFirst({
      where: {
        ...(typeof rawOrderId === "string" && rawOrderId.trim()
          ? { orderId: rawOrderId.trim() }
          : {
              providerId: provider.id,
              type: MOMO_PAYMENT_TYPE_PROVIDER_DEPOSIT,
              provider: MOMO_PROVIDER,
              status: "PENDING",
            }),
      },
      orderBy: { createAt: "desc" },
    });

    if (!payment || payment.providerId !== provider.id) {
      throw new NotFoundException("Provider deposit payment not found");
    }

    if (payment.type !== MOMO_PAYMENT_TYPE_PROVIDER_DEPOSIT) {
      throw new BadRequestException("Payment is not a provider deposit payment");
    }

    if (payment.status === "SUCCESS") {
      return {
        payment,
        momoResponse: null,
        synced: false,
      };
    }

    const momoResponse = await fetchMomoQueryPayment(payment.orderId);
    const responsePayload = {
      ...momoResponse,
      orderId: payment.orderId,
      amount: momoResponse.amount ?? payment.amount,
    };

    const updatedPayment = await applyPaymentResult(
      payment,
      responsePayload as Record<string, unknown>,
      JSON.stringify(momoResponse),
      { markNonSuccessFailed: false },
    );

    return {
      payment: updatedPayment,
      momoResponse,
      synced: Number(momoResponse.resultCode) === 0,
    };
  },

  async handleIpn(req: Request) {
    const payload = req.body as Record<string, unknown>;
    return markPaymentResult(payload, JSON.stringify(payload));
  },

  async handleReturn(req: Request) {
    const payload = req.query as Record<string, unknown>;
    return markPaymentResult(payload, JSON.stringify(payload));
  },

  async handleProviderDepositIpn(req: Request) {
    const payload = req.body as Record<string, unknown>;
    return markPaymentResult(payload, JSON.stringify(payload));
  },

  async handleProviderDepositReturn(req: Request) {
    const payload = req.query as Record<string, unknown>;
    return markPaymentResult(payload, JSON.stringify(payload));
  },
};
