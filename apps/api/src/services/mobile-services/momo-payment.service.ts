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

const MOMO_PROVIDER = "MOMO";
const MOMO_REQUEST_TYPE = "captureWallet";
const MOMO_MIN_AMOUNT = 1_000;
const MOMO_DEFAULT_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create";
const MOMO_FETCH_TIMEOUT_MS = 30_000;

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

async function getCustomerByUser(userId: string) {
  const customer = await prisma.customers.findUnique({ where: { userId } });
  if (!customer) throw new ForbiddenException("Customer profile not found");
  return customer;
}

async function markPaymentResult(payload: Record<string, unknown>, raw: string) {
  verifyMomoResultSignature(payload);

  const orderId = String(payload.orderId ?? "");
  const requestId = String(payload.requestId ?? "");
  const resultCode = Number(payload.resultCode);
  const message = typeof payload.message === "string" ? payload.message : null;
  const transId = payload.transId !== undefined ? String(payload.transId) : null;

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

  const isSuccess = resultCode === 0;
  const now = new Date();

  const updatedPayment = await prisma.$transaction(async (tx) => {
    const updated = await tx.payment_transactions.update({
      where: { id: payment.id },
      data: {
        status: isSuccess ? "SUCCESS" : "FAILED",
        resultCode: Number.isFinite(resultCode) ? resultCode : null,
        message,
        transId,
        rawIpn: raw,
        paidAt: isSuccess ? now : payment.paidAt,
      },
    });

    if (isSuccess) {
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

    return updated;
  });

  if (isSuccess) {
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

  return updatedPayment;
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
    if (amount < MOMO_MIN_AMOUNT) {
      throw new BadRequestException(`MoMo amount must be at least ${MOMO_MIN_AMOUNT} VND`);
    }

    const partnerCode = getRequiredEnv("MOMO_PARTNER_CODE");
    const accessKey = getRequiredEnv("MOMO_ACCESS_KEY");
    const secretKey = getRequiredEnv("MOMO_SECRET_KEY");
    const redirectUrl = getRequiredEnv("MOMO_REDIRECT_URL");
    const ipnUrl = getRequiredEnv("MOMO_IPN_URL");
    const partnerName = process.env.MOMO_PARTNER_NAME || "PetLink";
    const storeId = process.env.MOMO_STORE_ID || "PetLink";

    const existingPayment = await prisma.payment_transactions.findFirst({
      where: {
        bookingId: booking.id,
        provider: MOMO_PROVIDER,
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

    const requestId = crypto.randomUUID();
    const orderId = `booking-${booking.id}-${Date.now()}`;
    const orderInfo = `PetLink booking ${booking.id}`;
    const extraData = encodeExtraData({
      bookingId: booking.id,
      customerId: booking.customerId,
      providerId: booking.providerId,
    });

    const rawSignature = buildCreateSignature({
      accessKey,
      amount,
      extraData,
      ipnUrl,
      orderId,
      orderInfo,
      partnerCode,
      redirectUrl,
      requestId,
      requestType: MOMO_REQUEST_TYPE,
    });

    const signature = hmacSha256(rawSignature, secretKey);
    const requestBody = {
      partnerCode,
      partnerName,
      storeId,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: "vi",
      requestType: MOMO_REQUEST_TYPE,
      extraData,
      signature,
    };

    const momoResponse = await fetchMomoCreatePayment(requestBody);

    const payment = await prisma.payment_transactions.create({
      data: {
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

  async handleIpn(req: Request) {
    const payload = req.body as Record<string, unknown>;
    return markPaymentResult(payload, JSON.stringify(payload));
  },

  async handleReturn(req: Request) {
    const payload = req.query as Record<string, unknown>;
    return markPaymentResult(payload, JSON.stringify(payload));
  },
};
