import sgMail, { type MailDataRequired } from "@sendgrid/mail";

type EmailRecipient = {
  email?: string | null;
  name?: string | null;
};

type BookingEmailInput = {
  bookingId: string;
  customer?: EmailRecipient | null;
  provider?: EmailRecipient | null;
  serviceName?: string | null;
  appointmentStart?: Date | string | null;
  appointmentEnd?: Date | string | null;
  totalAmount?: number | null;
  paymentMethod?: string | null;
  reason?: string | null;
};

type PaymentEmailInput = {
  recipient: EmailRecipient;
  amount: number;
  orderId?: string | null;
  transId?: string | null;
  bookingId?: string | null;
  providerName?: string | null;
};

let isConfigured = false;
let missingConfigLogged = false;

function getSendGridApiKey() {
  return process.env.SENDGRID_API_KEY || process.env.SENDGIRD_API_KEY;
}

function getFrom() {
  return {
    email: process.env.SENDGRID_FROM_EMAIL || "no-reply@petlink.io.vn",
    name: process.env.SENDGRID_FROM_NAME || "PetLink",
  };
}

function ensureConfigured() {
  if (isConfigured) return true;

  const apiKey = getSendGridApiKey();
  if (!apiKey) {
    if (!missingConfigLogged) {
      console.warn(
        "[email] Missing SENDGRID_API_KEY. Email delivery is disabled.",
      );
      missingConfigLogged = true;
    }
    return false;
  }

  sgMail.setApiKey(apiKey);
  isConfigured = true;
  return true;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMoney(amount?: number | null) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

function formatDateTime(value?: Date | string | null) {
  if (!value) return "Chưa có thời gian";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có thời gian";

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Bangkok",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getName(recipient?: EmailRecipient | null, fallback = "ban") {
  return recipient?.name?.trim() || fallback;
}

function getProviderName(input: BookingEmailInput) {
  return input.provider?.name?.trim() || "provider";
}

function getCustomerName(input: BookingEmailInput) {
  return input.customer?.name?.trim() || "khách hàng";
}

function bookingDetailsHtml(input: BookingEmailInput) {
  return `
    <ul>
      <li><strong>Mã booking:</strong> ${escapeHtml(input.bookingId)}</li>
      <li><strong>Nhà cung cấp:</strong> ${escapeHtml(getProviderName(input))}</li>
      <li><strong>Dịch vụ:</strong> ${escapeHtml(input.serviceName || "ịch vụ PetLink")}</li>
      <li><strong>Thời gian:</strong> ${escapeHtml(formatDateTime(input.appointmentStart))}</li>
      <li><strong>Thành tiền:</strong> ${escapeHtml(formatMoney(input.totalAmount))}</li>
      <li><strong>Thanh toán:</strong> ${escapeHtml(input.paymentMethod || "CASH")}</li>
    </ul>
  `;
}

function bookingDetailsText(input: BookingEmailInput) {
  return [
    `Mã booking: ${input.bookingId}`,
    `Nhà cung cấp: ${getProviderName(input)}`,
    `Dịch vụ: ${input.serviceName || "ịch vụ PetLink"}`,
    `Thời gian: ${formatDateTime(input.appointmentStart)}`,
    `Thành tiền: ${formatMoney(input.totalAmount)}`,
    `Thanh toán: ${input.paymentMethod || "CASH"}`,
  ].join("\n");
}

function wrapHtml(title: string, body: string) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <h2 style="margin:0 0 12px">${escapeHtml(title)}</h2>
      ${body}
      <p style="margin-top:24px;color:#6b7280;font-size:13px">
        Email này được gửi từ PetLink.
      </p>
    </div>
  `;
}

async function sendMail(message: MailDataRequired) {
  if (!ensureConfigured()) return null;
  return sgMail.send(message);
}

async function safeSend(message: MailDataRequired) {
  try {
    return await sendMail(message);
  } catch (error) {
    console.error("[email] SendGrid send failed:", error);
    return null;
  }
}

function buildMessage(input: {
  to?: EmailRecipient | null;
  subject: string;
  text: string;
  html: string;
}): MailDataRequired | null {
  if (!input.to?.email) return null;

  return {
    to: {
      email: input.to.email,
      name: input.to.name ?? undefined,
    },
    from: getFrom(),
    subject: input.subject,
    text: input.text,
    html: input.html,
  };
}

async function safeSendBuiltMessage(input: {
  to?: EmailRecipient | null;
  subject: string;
  text: string;
  html: string;
}) {
  const message = buildMessage(input);
  if (!message) return null;
  return safeSend(message);
}

export const emailService = {
  async safeSendBookingCreatedToCustomer(input: BookingEmailInput) {
    const subject = "PetLink đã nhận booking của bạn và đang chờ provider xác nhận";
    const greeting = `Xin chào ${getName(input.customer)}, booking của bạn đã được tạo và đang chờ provider xác nhận.`;

    return safeSendBuiltMessage({
      to: input.customer,
      subject,
      text: `${greeting}\n\n${bookingDetailsText(input)}`,
      html: wrapHtml(
        subject,
        `<p>${escapeHtml(greeting)}</p>${bookingDetailsHtml(input)}`,
      ),
    });
  },

  async safeSendNewBookingToProvider(input: BookingEmailInput) {
    const subject = "PetLink có booking mới từ khách hàng";
    const greeting = `Xin chào ${getProviderName(input)}, ${getCustomerName(input)} vừa đặt lịch mới. Vui lòng xác nhận hoặc từ chối booking.`;

    return safeSendBuiltMessage({
      to: input.provider,
      subject,
      text: `${greeting}\n\n${bookingDetailsText(input)}`,
      html: wrapHtml(
        subject,
        `<p>${escapeHtml(greeting)}</p>${bookingDetailsHtml(input)}`,
      ),
    });
  },

  async safeSendBookingConfirmedToCustomer(input: BookingEmailInput) {
    const subject = "Booking của bạn đã được xác nhận";
    const greeting = `${getProviderName(input)} đã xác nhận booking của bạn.`;

    return safeSendBuiltMessage({
      to: input.customer,
      subject,
      text: `${greeting}\n\n${bookingDetailsText(input)}`,
      html: wrapHtml(
        subject,
        `<p>${escapeHtml(greeting)}</p>${bookingDetailsHtml(input)}`,
      ),
    });
  },

  async safeSendBookingRejectedToCustomer(input: BookingEmailInput) {
    const subject = "Booking của bạn đã bị từ chối";
    const reason = input.reason ? `Lý do: ${input.reason}` : "Provider chưa cung cấp lý do.";
    const greeting = `${getProviderName(input)} đã từ chối booking của bạn. ${reason}`;

    return safeSendBuiltMessage({
      to: input.customer,
      subject,
      text: `${greeting}\n\n${bookingDetailsText(input)}`,
      html: wrapHtml(
        subject,
        `<p>${escapeHtml(greeting)}</p>${bookingDetailsHtml(input)}`,
      ),
    });
  },

  async safeSendBookingCancelledToProvider(input: BookingEmailInput) {
    const subject = "Customer đã hủy booking";
    const reason = input.reason ? `Lý do: ${input.reason}` : "Customer chưa cung cấp lý do.";
    const greeting = `${getCustomerName(input)} đã hủy booking. ${reason}`;

    return safeSendBuiltMessage({
      to: input.provider,
      subject,
      text: `${greeting}\n\n${bookingDetailsText(input)}`,
      html: wrapHtml(
        subject,
        `<p>${escapeHtml(greeting)}</p>${bookingDetailsHtml(input)}`,
      ),
    });
  },

  async safeSendBookingPaymentSuccessToCustomer(input: PaymentEmailInput) {
    const subject = "Thanh toán booking thành công";
    const text = [
      `Xin chào ${getName(input.recipient)}, thanh toán booking của bạn đã thành công.`,
      `Mã booking: ${input.bookingId ?? "N/A"}`,
      `Số tiền: ${formatMoney(input.amount)}`,
      `Mã giao dịch: ${input.transId ?? input.orderId ?? "N/A"}`,
    ].join("\n");

    return safeSendBuiltMessage({
      to: input.recipient,
      subject,
      text,
      html: wrapHtml(
        subject,
        `
          <p>Xin chào ${escapeHtml(getName(input.recipient))}, thanh toán booking của bạn đã thành công.</p>
          <ul>
            <li><strong>Mã booking:</strong> ${escapeHtml(input.bookingId ?? "N/A")}</li>
            <li><strong>Số tiền:</strong> ${escapeHtml(formatMoney(input.amount))}</li>
            <li><strong>Mã giao dịch:</strong> ${escapeHtml(input.transId ?? input.orderId ?? "N/A")}</li>
          </ul>
        `,
      ),
    });
  },

  async safeSendProviderDepositPaymentSuccess(input: PaymentEmailInput) {
    const subject = "Nạp ký quỹ thành công";
    const text = [
      `Xin chào ${getName(input.recipient)}, giao dịch nạp ký quỹ của bạn đã thành công.`,
      `Provider: ${input.providerName ?? "Provider PetLink"}`,
      `Số tiền: ${formatMoney(input.amount)}`,
      `Mã giao dịch: ${input.transId ?? input.orderId ?? "N/A"}`,
    ].join("\n");

    return safeSendBuiltMessage({
      to: input.recipient,
      subject,
      text,
      html: wrapHtml(
        subject,
        `
          <p>Xin chào ${escapeHtml(getName(input.recipient))}, giao dịch nạp ký quỹ của bạn đã thành công.</p>
          <ul>
            <li><strong>Provider:</strong> ${escapeHtml(input.providerName ?? "Provider PetLink")}</li>
            <li><strong>Số tiền:</strong> ${escapeHtml(formatMoney(input.amount))}</li>
            <li><strong>Mã giao dịch:</strong> ${escapeHtml(input.transId ?? input.orderId ?? "N/A")}</li>
          </ul>
        `,
      ),
    });
  },

  async safeSendBookingCompletedToCustomer(input: BookingEmailInput) {
    const subject = "Booking đã hoàn tất";
    const greeting = `Booking của bạn tại ${getProviderName(input)} đã hoàn tất. Bạn có thể đánh giá provider trên ứng dụng PetLink.`;

    return safeSendBuiltMessage({
      to: input.customer,
      subject,
      text: `${greeting}\n\n${bookingDetailsText(input)}`,
      html: wrapHtml(
        subject,
        `<p>${escapeHtml(greeting)}</p>${bookingDetailsHtml(input)}`,
      ),
    });
  },
};
