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
  if (!value) return "Chua co thoi gian";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Chua co thoi gian";

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
  return input.customer?.name?.trim() || "khach hang";
}

function bookingDetailsHtml(input: BookingEmailInput) {
  return `
    <ul>
      <li><strong>Ma booking:</strong> ${escapeHtml(input.bookingId)}</li>
      <li><strong>Nha cung cap:</strong> ${escapeHtml(getProviderName(input))}</li>
      <li><strong>Dich vu:</strong> ${escapeHtml(input.serviceName || "Dich vu PetLink")}</li>
      <li><strong>Thoi gian:</strong> ${escapeHtml(formatDateTime(input.appointmentStart))}</li>
      <li><strong>Thanh tien:</strong> ${escapeHtml(formatMoney(input.totalAmount))}</li>
      <li><strong>Thanh toan:</strong> ${escapeHtml(input.paymentMethod || "CASH")}</li>
    </ul>
  `;
}

function bookingDetailsText(input: BookingEmailInput) {
  return [
    `Ma booking: ${input.bookingId}`,
    `Nha cung cap: ${getProviderName(input)}`,
    `Dich vu: ${input.serviceName || "Dich vu PetLink"}`,
    `Thoi gian: ${formatDateTime(input.appointmentStart)}`,
    `Thanh tien: ${formatMoney(input.totalAmount)}`,
    `Thanh toan: ${input.paymentMethod || "CASH"}`,
  ].join("\n");
}

function wrapHtml(title: string, body: string) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <h2 style="margin:0 0 12px">${escapeHtml(title)}</h2>
      ${body}
      <p style="margin-top:24px;color:#6b7280;font-size:13px">
        Email nay duoc gui tu PetLink.
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
    const subject = "PetLink da nhan booking cua ban";
    const greeting = `Xin chao ${getName(input.customer)}, booking cua ban da duoc tao va dang cho provider xac nhan.`;

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
    const subject = "PetLink co booking moi can xac nhan";
    const greeting = `Xin chao ${getProviderName(input)}, ${getCustomerName(input)} vua dat lich moi. Vui long xac nhan hoac tu choi booking.`;

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
    const subject = "Booking cua ban da duoc xac nhan";
    const greeting = `${getProviderName(input)} da xac nhan booking cua ban.`;

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
    const subject = "Booking cua ban da bi tu choi";
    const reason = input.reason ? `Ly do: ${input.reason}` : "Provider chua cung cap ly do.";
    const greeting = `${getProviderName(input)} da tu choi booking cua ban. ${reason}`;

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
    const subject = "Customer da huy booking";
    const reason = input.reason ? `Ly do: ${input.reason}` : "Customer chua cung cap ly do.";
    const greeting = `${getCustomerName(input)} da huy booking. ${reason}`;

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
    const subject = "Thanh toan booking thanh cong";
    const text = [
      `Xin chao ${getName(input.recipient)}, thanh toan booking cua ban da thanh cong.`,
      `Ma booking: ${input.bookingId ?? "N/A"}`,
      `So tien: ${formatMoney(input.amount)}`,
      `Ma giao dich: ${input.transId ?? input.orderId ?? "N/A"}`,
    ].join("\n");

    return safeSendBuiltMessage({
      to: input.recipient,
      subject,
      text,
      html: wrapHtml(
        subject,
        `
          <p>Xin chao ${escapeHtml(getName(input.recipient))}, thanh toan booking cua ban da thanh cong.</p>
          <ul>
            <li><strong>Ma booking:</strong> ${escapeHtml(input.bookingId ?? "N/A")}</li>
            <li><strong>So tien:</strong> ${escapeHtml(formatMoney(input.amount))}</li>
            <li><strong>Ma giao dich:</strong> ${escapeHtml(input.transId ?? input.orderId ?? "N/A")}</li>
          </ul>
        `,
      ),
    });
  },

  async safeSendProviderDepositPaymentSuccess(input: PaymentEmailInput) {
    const subject = "Nap ky quy thanh cong";
    const text = [
      `Xin chao ${getName(input.recipient)}, giao dich nap ky quy cua ban da thanh cong.`,
      `Provider: ${input.providerName ?? "Provider PetLink"}`,
      `So tien: ${formatMoney(input.amount)}`,
      `Ma giao dich: ${input.transId ?? input.orderId ?? "N/A"}`,
    ].join("\n");

    return safeSendBuiltMessage({
      to: input.recipient,
      subject,
      text,
      html: wrapHtml(
        subject,
        `
          <p>Xin chao ${escapeHtml(getName(input.recipient))}, giao dich nap ky quy cua ban da thanh cong.</p>
          <ul>
            <li><strong>Provider:</strong> ${escapeHtml(input.providerName ?? "Provider PetLink")}</li>
            <li><strong>So tien:</strong> ${escapeHtml(formatMoney(input.amount))}</li>
            <li><strong>Ma giao dich:</strong> ${escapeHtml(input.transId ?? input.orderId ?? "N/A")}</li>
          </ul>
        `,
      ),
    });
  },

  async safeSendBookingCompletedToCustomer(input: BookingEmailInput) {
    const subject = "Booking da hoan tat";
    const greeting = `Booking cua ban tai ${getProviderName(input)} da hoan tat. Ban co the danh gia provider tren ung dung PetLink.`;

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
