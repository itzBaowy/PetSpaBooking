import bcrypt from "bcrypt";
import prisma from "../connect.prisma.ts";

const TEST_PASSWORD = "Test@123";

// ─── Helpers ────────────────────────────────────────────────────────────────

function minutesFromNow(min: number) {
  return new Date(Date.now() + min * 60 * 1000);
}
function hoursAgo(h: number) {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}
function daysAgo(d: number) {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000);
}
function idempotencyKey(suffix: string) {
  return `seed-${suffix}-${Date.now()}`;
}

// ─── Users ──────────────────────────────────────────────────────────────────

const testUsers = [
  { userName: "admin_test",        email: "admin.test@petlink.local",           phone: "0900000001", fullName: "Admin Test",           role: "ADMIN",    status: "ACTIVE" },
  { userName: "provider_test",     email: "provider.test@petlink.local",        phone: "0900000002", fullName: "Provider Verified",    role: "PROVIDER", status: "ACTIVE" },
  { userName: "provider_pending",  email: "provider.pending@petlink.local",     phone: "0900000004", fullName: "Provider Pending",     role: "PROVIDER", status: "ACTIVE" },
  { userName: "provider_rejected", email: "provider.rejected@petlink.local",    phone: "0900000005", fullName: "Provider Rejected",    role: "PROVIDER", status: "ACTIVE" },
  { userName: "provider_suspended",email: "provider.suspended@petlink.local",   phone: "0900000006", fullName: "Provider Suspended",   role: "PROVIDER", status: "ACTIVE" },
  { userName: "customer_test",     email: "customer.test@petlink.local",        phone: "0900000003", fullName: "Customer Test",        role: "CUSTOMER", status: "ACTIVE" },
  { userName: "customer_johndoe",  email: "johndoe@gmail.com",                  phone: "0909999876", fullName: "John Doe",             role: "CUSTOMER", status: "ACTIVE" },
  { userName: "customer_banned",   email: "customer.banned@petlink.local",      phone: "0900000007", fullName: "Banned Customer",      role: "CUSTOMER", status: "BANNED" },
] as const;

// ─── Provider definitions ────────────────────────────────────────────────────

const providerCases = [
  {
    userName: "provider_test",
    businessName: "PetLink Verified Spa",
    slug: "petlink-verified-spa",
    providerStatus: "VERIFIED",
    depositStatus: "ACTIVE",
    depositBalance: 500000,
    walletBalance: 1200000,
    adminNote: null,
  },
  {
    userName: "provider_pending",
    businessName: "PetLink Pending Spa",
    slug: "petlink-pending-spa",
    providerStatus: "PENDING_VERIFICATION",
    depositStatus: "NOT_PAID",
    depositBalance: 0,
    walletBalance: 0,
    adminNote: null,
  },
  {
    userName: "provider_rejected",
    businessName: "PetLink Rejected Spa",
    slug: "petlink-rejected-spa",
    providerStatus: "REJECTED",
    depositStatus: "NOT_PAID",
    depositBalance: 0,
    walletBalance: 0,
    adminNote: "Giấy phép kinh doanh chưa rõ. Vui lòng tải lại tài liệu.",
  },
  {
    userName: "provider_suspended",
    businessName: "PetLink Suspended Spa",
    slug: "petlink-suspended-spa",
    providerStatus: "SUSPENDED",
    depositStatus: "ACTIVE",
    depositBalance: 300000,
    walletBalance: 0,
    adminNote: "Tài khoản nhà cung cấp đang tạm khóa để kiểm tra vi phạm.",
  },
] as const;

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const password = await bcrypt.hash(TEST_PASSWORD, 10);
  const usersByName = new Map<string, { id: string }>();
  const customersByName = new Map<string, { id: string }>();

  // ── 0. Teardown (ordered: leaf → root) ────────────────────────────────────
  console.log("▶ Cleaning old seed data...");
  await prisma.admin_audit_logs.deleteMany({});
  await prisma.notifications.deleteMany({});
  await prisma.withdrawal_requests.deleteMany({});
  await prisma.wallet_transactions.deleteMany({});
  await prisma.booking_qr_logs.deleteMany({});
  await prisma.booking_disputes.deleteMany({});
  await prisma.reviews.deleteMany({});
  await prisma.bookings.deleteMany({});
  await prisma.pets.deleteMany({});
  await prisma.working_hours.deleteMany({});
  await prisma.services.deleteMany({});
  await prisma.provider_documents.deleteMany({});
  await prisma.providers.deleteMany({});
  await prisma.customers.deleteMany({});
  await prisma.users.deleteMany({});

  // ── 1. Users ────────────────────────────────────────────────────────────────
  console.log("▶ Seeding users...");
  for (const user of testUsers) {
    const saved = await prisma.users.upsert({
      where: { userName: user.userName },
      update: { email: user.email, phone: user.phone, fullName: user.fullName, password, role: user.role, status: user.status },
      create: { ...user, password },
      select: { id: true },
    });
    usersByName.set(user.userName, saved);

    if (user.role === "CUSTOMER") {
      const customer = await prisma.customers.upsert({
        where: { userId: saved.id },
        update: {},
        create: { userId: saved.id, location: "TP. Hồ Chí Minh" },
        select: { id: true },
      });
      customersByName.set(user.userName, customer);
    }
  }

  // ── 2. Providers ─────────────────────────────────────────────────────────────
  console.log("▶ Seeding providers...");
  const providersByName = new Map<string, { id: string }>();

  for (const pc of providerCases) {
    const user = usersByName.get(pc.userName)!;

    const provider = await prisma.providers.upsert({
      where: { userId: user.id },
      update: {
        businessName: pc.businessName,
        slug: pc.slug,
        providerStatus: pc.providerStatus,
        depositStatus: pc.depositStatus,
        depositBalance: pc.depositBalance,
        walletBalance: pc.walletBalance,
        adminNote: pc.adminNote,
      },
      create: {
        userId: user.id,
        businessName: pc.businessName,
        slug: pc.slug,
        description: "Hồ sơ dữ liệu mẫu dùng để kiểm tra luồng đăng nhập và hiển thị dịch vụ thật.",
        avatarUrl: "/brand/petlink-logo.png",
        coverImageUrl: "/brand/petlink-logo.png",
        phone: "0901234567",
        email: `${pc.slug}@petlink.local`,
        address: "123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh",
        ward: "Phường Bến Nghé",
        district: "Quận 1",
        province: "TP. Hồ Chí Minh",
        taxCode: "0312345678",
        identityNumber: "079203001234",
        identityFullName: pc.businessName,
        bankCode: "VCB",
        bankAccountNumber: "0123456789",
        bankAccountName: pc.businessName.toUpperCase(),
        lat: 10.7769,
        lng: 106.7009,
        providerStatus: pc.providerStatus,
        depositStatus: pc.depositStatus,
        depositBalance: pc.depositBalance,
        walletBalance: pc.walletBalance,
        adminNote: pc.adminNote,
      },
      select: { id: true },
    });
    providersByName.set(pc.userName, provider);

    // Documents
    await prisma.provider_documents.deleteMany({ where: { providerId: provider.id } });
    const docStatus = pc.providerStatus === "VERIFIED" ? "APPROVED"
      : pc.providerStatus === "REJECTED" ? "REJECTED" : "PENDING";
    await prisma.provider_documents.createMany({
      data: [
        { providerId: provider.id, documentType: "business_license", imageUrl: "/brand/petlink-logo.png", status: docStatus, adminNote: pc.adminNote },
        { providerId: provider.id, documentType: "id_card_front",    imageUrl: "/brand/petlink-logo.png", status: docStatus, adminNote: pc.adminNote },
      ],
    });

    // Services
    await prisma.services.deleteMany({ where: { providerId: provider.id } });
    await prisma.services.createMany({
      data: [
        {
          providerId: provider.id,
          name: `${pc.businessName} - Tắm & làm đẹp`,
          description: "Dịch vụ tắm, cắt tỉa lông và chăm sóc da cho thú cưng.",
          longDescription: "Dịch vụ tắm và làm đẹp toàn diện cho thú cưng bao gồm tắm bằng sữa tắm chuyên dụng, sấy khô, cắt tỉa lông tạo kiểu, vệ sinh tai và cắt móng.",
          price: 250000,
          duration: 60,
          category: "GROOMING",
          imageUrls: ["/brand/petlink-logo.png"],
          targetPets: ["DOG", "CAT"],
          benefits: ["Lông mượt thơm tho", "Sạch ve rận", "Tạo kiểu chuẩn spa"],
          isActive: true,
          isHiddenByAdmin: false,
        },
        {
          providerId: provider.id,
          name: `${pc.businessName} - Tiêm phòng`,
          description: "Dịch vụ tiêm phòng và tư vấn sức khỏe định kỳ.",
          longDescription: "Vắc-xin thiết yếu cho chó mèo và kiểm tra sức khỏe tổng quát trước khi tiêm.",
          price: 180000,
          duration: 45,
          category: "VETERINARY",
          imageUrls: ["/brand/petlink-logo.png"],
          targetPets: ["DOG", "CAT"],
          benefits: ["Tăng cường hệ miễn dịch", "Phòng bệnh truyền nhiễm", "Tư vấn miễn phí"],
          isActive: pc.providerStatus === "VERIFIED",
          isHiddenByAdmin: false,
        },
      ],
    });

    await prisma.working_hours.deleteMany({
      where: { providerId: provider.id },
    });
    await prisma.provider_availability_blocks.deleteMany({
      where: { providerId: provider.id },
    });
    // Working hours (Mon-Sat open, Sun closed)
    await prisma.working_hours.deleteMany({ where: { providerId: provider.id } });
    await prisma.working_hours.createMany({
      data: [
        { providerId: provider.id, dayOfWeek: 1, openTime: "08:00", closeTime: "18:00", isClosed: false },
        { providerId: provider.id, dayOfWeek: 2, openTime: "08:00", closeTime: "18:00", isClosed: false },
        { providerId: provider.id, dayOfWeek: 3, openTime: "08:00", closeTime: "18:00", isClosed: false },
        { providerId: provider.id, dayOfWeek: 4, openTime: "08:00", closeTime: "18:00", isClosed: false },
        { providerId: provider.id, dayOfWeek: 5, openTime: "08:00", closeTime: "18:00", isClosed: false },
        { providerId: provider.id, dayOfWeek: 6, openTime: "09:00", closeTime: "17:00", isClosed: false },
        { providerId: provider.id, dayOfWeek: 0, openTime: "10:00", closeTime: "16:00", isClosed: true },
      ],
    });
  }

  // ── 3. Pets (customer_test) ───────────────────────────────────────────────
  const customer = customersByName.get("customer_test")!;
  const johndoe  = customersByName.get("customer_johndoe")!;

  console.log("▶ Seeding pets...");
  await prisma.pets.deleteMany({ where: { customerId: customer.id } });
  await prisma.pets.createMany({
    data: [
      {
        customerId: customer.id, name: "Bella", breed: "Golden Retriever", gender: "Cái",
        ageLabel: "3 tuổi", imageUrl: "/brand/petlink-logo.png", status: "active",
        weight: "30 kg", height: "55 cm", color: "Vàng kim",
        photos: ["/brand/petlink-logo.png"],
        nextVaccineDate: "12 Th12, 2024",
        healthReminder: { title: "Tiêm phòng dại", date: "12 Th12, 2024" },
        medicalRecords: [{ id: "rec_bella_1", title: "Khám định kỳ", description: "Sức khỏe tốt.", date: "10 Th10, 2024" }],
      },
      {
        customerId: customer.id, name: "Luna", breed: "Mèo Xiêm", gender: "Cái",
        ageLabel: "2 tuổi", imageUrl: "/brand/petlink-logo.png", status: "active",
        weight: "4 kg", height: "25 cm", color: "Trắng xám",
        photos: ["/brand/petlink-logo.png"],
        nextVaccineDate: "05 Th1, 2025",
        healthReminder: { title: "Tẩy giun định kỳ", date: "05 Th1, 2025" },
        medicalRecords: [{ id: "rec_luna_1", title: "Tiêm vắc xin 4 bệnh", description: "Đã tiêm mũi 3.", date: "15 Th08, 2024" }],
      },
    ],
  });

  // ── 4. Bookings (verified provider + customer_test) ───────────────────────
  console.log("▶ Seeding bookings...");
  const verifiedProvider = providersByName.get("provider_test")!;

  const verifiedService = await prisma.services.findFirst({
    where: { providerId: verifiedProvider.id, isActive: true },
    select: { id: true, price: true, duration: true },
  });
  if (!verifiedService) throw new Error("Missing service for provider_test");

  // Delete old related data first to avoid constraint errors
  await prisma.reviews.deleteMany({ where: { providerId: verifiedProvider.id } });
  await prisma.booking_disputes.deleteMany({ where: { providerId: verifiedProvider.id } });
  await prisma.wallet_transactions.deleteMany({ where: { providerId: verifiedProvider.id } });
  await prisma.withdrawal_requests.deleteMany({ where: { providerId: verifiedProvider.id } });
  await prisma.bookings.deleteMany({ where: { providerId: verifiedProvider.id } });

  const svc = verifiedService;
  const commission = svc.price * 0.15;
  const earning    = svc.price - commission;

  // Helper to create a booking quickly
  async function createBooking(opts: {
    customerId: string;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    appointmentStart: Date;
    checkedInAt?: Date;
    checkedOutAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    rejectedAt?: Date;
    confirmedAt?: Date;
    cancelReason?: string;
    rejectReason?: string;
    commissionAmount?: number;
    providerEarning?: number;
    walletCommissionAmount?: number;
    depositCommissionAmount?: number;
    commissionProcessedAt?: Date;
  }) {
    return prisma.bookings.create({
      data: {
        providerId: verifiedProvider.id,
        customerId: opts.customerId,
        serviceId: svc.id,
        appointmentStart: opts.appointmentStart,
        appointmentEnd: new Date(opts.appointmentStart.getTime() + svc.duration * 60 * 1000),
        status: opts.status,
        paymentMethod: opts.paymentMethod,
        paymentStatus: opts.paymentStatus,
        totalAmount: svc.price,
        currency: "VND",
        note: `Seed booking [${opts.status}]`,
        cancelReason: opts.cancelReason,
        rejectReason: opts.rejectReason,
        confirmedAt: opts.confirmedAt,
        checkedInAt: opts.checkedInAt,
        checkedOutAt: opts.checkedOutAt,
        completedAt: opts.completedAt,
        cancelledAt: opts.cancelledAt,
        rejectedAt: opts.rejectedAt,
        commissionAmount: opts.commissionAmount,
        providerEarning: opts.providerEarning,
        walletCommissionAmount: opts.walletCommissionAmount,
        depositCommissionAmount: opts.depositCommissionAmount,
        commissionProcessedAt: opts.commissionProcessedAt,
      },
      select: { id: true },
    });
  }

  // COMPLETED booking (cash) — 3 days ago
  const bookingCompleted = await createBooking({
    customerId: customer.id, status: "COMPLETED", paymentMethod: "CASH", paymentStatus: "UNPAID",
    appointmentStart: daysAgo(3),
    confirmedAt: daysAgo(3),
    checkedInAt: hoursAgo(72),
    checkedOutAt: hoursAgo(71),
    completedAt: hoursAgo(47),
    commissionAmount: commission, providerEarning: earning,
    walletCommissionAmount: commission, depositCommissionAmount: 0,
    commissionProcessedAt: hoursAgo(47),
  });

  // COMPLETED booking (online) — 5 days ago
  const bookingCompletedOnline = await createBooking({
    customerId: johndoe.id, status: "COMPLETED", paymentMethod: "ONLINE", paymentStatus: "SUCCESS",
    appointmentStart: daysAgo(5),
    confirmedAt: daysAgo(5),
    checkedInAt: hoursAgo(120),
    checkedOutAt: hoursAgo(119),
    completedAt: hoursAgo(95),
    commissionAmount: commission, providerEarning: earning,
    walletCommissionAmount: 0, depositCommissionAmount: 0,
    commissionProcessedAt: hoursAgo(95),
  });

  // PENDING
  const bookingPending = await createBooking({
    customerId: customer.id, status: "PENDING", paymentMethod: "CASH", paymentStatus: "UNPAID",
    appointmentStart: minutesFromNow(120),
  });

  // CONFIRMED
  const bookingConfirmed = await createBooking({
    customerId: customer.id, status: "CONFIRMED", paymentMethod: "ONLINE", paymentStatus: "SUCCESS",
    appointmentStart: minutesFromNow(60),
    confirmedAt: hoursAgo(1),
  });

  // CHECKED_IN
  const bookingCheckedIn = await createBooking({
    customerId: johndoe.id, status: "CHECKED_IN", paymentMethod: "CASH", paymentStatus: "UNPAID",
    appointmentStart: hoursAgo(1),
    confirmedAt: hoursAgo(2),
    checkedInAt: hoursAgo(1),
  });

  // CHECKED_OUT (in 24h dispute window)
  const bookingCheckedOut = await createBooking({
    customerId: customer.id, status: "CHECKED_OUT", paymentMethod: "CASH", paymentStatus: "UNPAID",
    appointmentStart: hoursAgo(3),
    confirmedAt: hoursAgo(4),
    checkedInAt: hoursAgo(3),
    checkedOutAt: hoursAgo(2),
  });

  // CANCELLED
  const bookingCancelled = await createBooking({
    customerId: johndoe.id, status: "CANCELLED", paymentMethod: "CASH", paymentStatus: "UNPAID",
    appointmentStart: daysAgo(1),
    cancelReason: "Khách hàng thay đổi lịch",
    cancelledAt: daysAgo(1),
  });

  // REJECTED
  const bookingRejected = await createBooking({
    customerId: customer.id, status: "REJECTED", paymentMethod: "CASH", paymentStatus: "UNPAID",
    appointmentStart: daysAgo(2),
    rejectReason: "Nhà cung cấp không có lịch trống",
    rejectedAt: daysAgo(2),
  });

  // DISPUTE
  const bookingDisputed = await createBooking({
    customerId: johndoe.id, status: "DISPUTE", paymentMethod: "CASH", paymentStatus: "UNPAID",
    appointmentStart: hoursAgo(30),
    confirmedAt: hoursAgo(32),
    checkedInAt: hoursAgo(30),
    checkedOutAt: hoursAgo(28),
  });

  // ── 5. Review (for COMPLETED booking) ────────────────────────────────────
  console.log("▶ Seeding reviews...");
  await prisma.reviews.createMany({
    data: [
      {
        bookingId: bookingCompleted.id,
        providerId: verifiedProvider.id,
        customerId: customer.id,
        rating: 5,
        comment: "Dịch vụ rất chuyên nghiệp, thú cưng của tôi rất hài lòng.",
        images: [],
      },
      {
        bookingId: bookingCompletedOnline.id,
        providerId: verifiedProvider.id,
        customerId: johndoe.id,
        rating: 4,
        comment: "Dịch vụ tốt, nhân viên thân thiện.",
        images: [],
      },
    ],
  });

  // ── 6. Disputes ───────────────────────────────────────────────────────────
  console.log("▶ Seeding disputes...");
  const adminUser = usersByName.get("admin_test")!;

  // PENDING dispute (on bookingDisputed)
  await prisma.booking_disputes.create({
    data: {
      bookingId: bookingDisputed.id,
      customerId: johndoe.id,
      providerId: verifiedProvider.id,
      reason: "Dịch vụ không đúng như mô tả",
      description: "Nhà cung cấp đã không hoàn thành dịch vụ như đã thỏa thuận.",
      status: "PENDING",
    },
  });

  // RESOLVED_PROVIDER_WIN dispute (on bookingCheckedOut)
  await prisma.booking_disputes.create({
    data: {
      bookingId: bookingCheckedOut.id,
      customerId: customer.id,
      providerId: verifiedProvider.id,
      reason: "Tôi không hài lòng với chất lượng dịch vụ",
      description: "Lông thú cưng không được cắt đúng kiểu yêu cầu.",
      status: "RESOLVED_PROVIDER_WIN",
      resolvedBy: adminUser.id,
      resolvedAt: hoursAgo(1),
      adminNote: "Nhà cung cấp đã hoàn thành dịch vụ đúng cam kết. Xét xử nhà cung cấp thắng.",
    },
  });

  // ── 7. Wallet Transactions (for verified provider) ────────────────────────
  console.log("▶ Seeding wallet transactions...");
  await prisma.wallet_transactions.createMany({
    data: [
      // Online earning from completedOnline
      {
        providerId: verifiedProvider.id,
        bookingId: bookingCompletedOnline.id,
        idempotencyKey: idempotencyKey("online-earn-1"),
        type: "ONLINE_EARNING",
        balanceType: "WALLET",
        amount: earning,
        balanceAfter: earning,
        note: "Thu nhập từ booking thanh toán online",
        createAt: hoursAgo(95),
      },
      // Cash commission deduction from completedCash
      {
        providerId: verifiedProvider.id,
        bookingId: bookingCompleted.id,
        idempotencyKey: idempotencyKey("cash-commission-1"),
        type: "CASH_COMMISSION_DEDUCTION",
        balanceType: "WALLET",
        amount: -commission,
        balanceAfter: earning - commission,
        note: "Trừ hoa hồng từ booking thanh toán tiền mặt",
        createAt: hoursAgo(47),
      },
      // Manual adjustment by admin
      {
        providerId: verifiedProvider.id,
        bookingId: null,
        idempotencyKey: idempotencyKey("manual-adjust-1"),
        type: "MANUAL_ADJUSTMENT",
        balanceType: "WALLET",
        amount: 500000,
        balanceAfter: 1200000,
        note: "Bồi thường thủ công từ admin",
        createAt: daysAgo(1),
      },
      // Deposit commission deduction
      {
        providerId: verifiedProvider.id,
        bookingId: bookingCompleted.id,
        idempotencyKey: idempotencyKey("deposit-commission-1"),
        type: "DEPOSIT_COMMISSION_DEDUCTION",
        balanceType: "DEPOSIT",
        amount: -50000,
        balanceAfter: 500000,
        note: "Trừ hoa hồng từ ký quỹ (ví không đủ)",
        createAt: daysAgo(3),
      },
    ],
  });

  // ── 8. Withdrawal Requests (for verified provider) ────────────────────────
  console.log("▶ Seeding withdrawal requests...");
  await prisma.withdrawal_requests.createMany({
    data: [
      // PAID withdrawal
      {
        providerId: verifiedProvider.id,
        amount: 300000,
        bankCode: "VCB",
        bankAccountNumber: "0123456789",
        bankAccountName: "PETLINK VERIFIED SPA",
        status: "PAID",
        reason: "Rút tiền định kỳ tháng 6",
        adminNote: "Đã chuyển khoản thành công ngày 01/07",
        requestedAt: daysAgo(10),
        reviewedBy: adminUser.id,
        reviewedAt: daysAgo(9),
        paidAt: daysAgo(8),
      },
      // APPROVED withdrawal
      {
        providerId: verifiedProvider.id,
        amount: 200000,
        bankCode: "VCB",
        bankAccountNumber: "0123456789",
        bankAccountName: "PETLINK VERIFIED SPA",
        status: "APPROVED",
        reason: "Rút tiền tuần này",
        adminNote: "Đã duyệt, chờ chuyển khoản",
        requestedAt: daysAgo(3),
        reviewedBy: adminUser.id,
        reviewedAt: daysAgo(2),
        paidAt: null,
      },
      // PENDING withdrawal
      {
        providerId: verifiedProvider.id,
        amount: 150000,
        bankCode: "VCB",
        bankAccountNumber: "0123456789",
        bankAccountName: "PETLINK VERIFIED SPA",
        status: "PENDING",
        reason: "Rút tiền hôm nay",
        adminNote: null,
        requestedAt: hoursAgo(2),
        reviewedBy: null,
        reviewedAt: null,
        paidAt: null,
      },
      // REJECTED withdrawal
      {
        providerId: verifiedProvider.id,
        amount: 100000,
        bankCode: "VCB",
        bankAccountNumber: "0123456789",
        bankAccountName: "PETLINK VERIFIED SPA",
        status: "REJECTED",
        reason: "Rút tiền khẩn",
        adminNote: "Thông tin tài khoản ngân hàng không khớp. Vui lòng cập nhật.",
        requestedAt: daysAgo(5),
        reviewedBy: adminUser.id,
        reviewedAt: daysAgo(4),
        paidAt: null,
      },
    ],
  });

  // ── 9. Admin Audit Logs ───────────────────────────────────────────────────
  console.log("▶ Seeding audit logs...");
  await prisma.admin_audit_logs.deleteMany({ where: { adminId: adminUser.id } });
  await prisma.admin_audit_logs.createMany({
    data: [
      { adminId: adminUser.id, action: "PROVIDER_VERIFY",        targetType: "Provider",           targetId: verifiedProvider.id, metadata: JSON.stringify({ note: "Hồ sơ hợp lệ" }),                     createAt: daysAgo(7) },
      { adminId: adminUser.id, action: "PROVIDER_REJECT",        targetType: "Provider",           targetId: providersByName.get("provider_rejected")!.id, metadata: JSON.stringify({ reason: "Giấy phép không rõ" }),       createAt: daysAgo(6) },
      { adminId: adminUser.id, action: "PROVIDER_SUSPEND",       targetType: "Provider",           targetId: providersByName.get("provider_suspended")!.id, metadata: JSON.stringify({ reason: "Vi phạm chính sách" }),       createAt: daysAgo(4) },
      { adminId: adminUser.id, action: "DISPUTE_RESOLVE",        targetType: "BookingDispute",     targetId: bookingCheckedOut.id, metadata: JSON.stringify({ status: "RESOLVED_PROVIDER_WIN", adminNote: "Nhà cung cấp thắng" }), createAt: hoursAgo(1) },
      { adminId: adminUser.id, action: "PROVIDER_WALLET_ADJUST", targetType: "ProviderWallet",     targetId: verifiedProvider.id, metadata: JSON.stringify({ balanceType: "WALLET", amount: 500000, reason: "Bồi thường thủ công" }), createAt: daysAgo(1) },
      { adminId: adminUser.id, action: "WITHDRAWAL_APPROVE",     targetType: "WithdrawalRequest",  targetId: verifiedProvider.id, metadata: JSON.stringify({ amount: 200000, adminNote: "Đã duyệt" }),   createAt: daysAgo(2) },
      { adminId: adminUser.id, action: "WITHDRAWAL_MARK_PAID",   targetType: "WithdrawalRequest",  targetId: verifiedProvider.id, metadata: JSON.stringify({ amount: 300000, adminNote: "Đã chuyển khoản" }), createAt: daysAgo(8) },
      { adminId: adminUser.id, action: "WITHDRAWAL_REJECT",      targetType: "WithdrawalRequest",  targetId: verifiedProvider.id, metadata: JSON.stringify({ amount: 100000, adminNote: "Thông tin tài khoản không khớp" }), createAt: daysAgo(4) },
      { adminId: adminUser.id, action: "USER_STATUS_UPDATE",     targetType: "User",               targetId: usersByName.get("customer_banned")!.id, metadata: JSON.stringify({ status: "BANNED", reason: "Vi phạm điều khoản" }), createAt: daysAgo(3) },
    ],
  });

  // ── 10. Notifications ─────────────────────────────────────────────────────
  console.log("▶ Seeding notifications...");
  const customerUserId = usersByName.get("customer_test")!.id;
  const providerUserId = usersByName.get("provider_test")!.id;

  await prisma.notifications.deleteMany({ where: { userId: { in: [customerUserId, providerUserId, adminUser.id] } } });
  await prisma.notifications.createMany({
    data: [
      // Customer notifications
      { userId: customerUserId, type: "BOOKING_CONFIRMED",  title: "Lịch đặt đã được xác nhận",   message: "Nhà cung cấp đã xác nhận lịch hẹn của bạn.",       data: JSON.stringify({ bookingId: bookingConfirmed.id }),  readAt: hoursAgo(1) },
      { userId: customerUserId, type: "BOOKING_COMPLETED",  title: "Dịch vụ đã hoàn thành",       message: "Cảm ơn bạn đã sử dụng dịch vụ. Hãy để lại đánh giá!", data: JSON.stringify({ bookingId: bookingCompleted.id }) },
      { userId: customerUserId, type: "BOOKING_REJECTED",   title: "Lịch đặt bị từ chối",         message: "Nhà cung cấp không thể phục vụ vào thời gian này.",  data: JSON.stringify({ bookingId: bookingRejected.id }),   readAt: daysAgo(2) },
      { userId: customerUserId, type: "DISPUTE_RESOLVED",   title: "Tranh chấp đã được xử lý",    message: "Admin đã giải quyết tranh chấp của bạn.",           data: JSON.stringify({ bookingId: bookingCheckedOut.id }) },
      // Provider notifications
      { userId: providerUserId, type: "BOOKING_CONFIRMED",  title: "Bạn có lịch hẹn mới",        message: "Khách hàng vừa đặt lịch dịch vụ.",                 data: JSON.stringify({ bookingId: bookingPending.id }) },
      { userId: providerUserId, type: "WITHDRAWAL_APPROVED",title: "Yêu cầu rút tiền được duyệt",message: "Admin đã duyệt yêu cầu rút 200,000 VND của bạn.",   data: JSON.stringify({ amount: 200000 }),                  readAt: daysAgo(2) },
      { userId: providerUserId, type: "WITHDRAWAL_PAID",    title: "Tiền đã được chuyển khoản",   message: "Admin đã chuyển khoản 300,000 VND vào tài khoản.", data: JSON.stringify({ amount: 300000 }),                  readAt: daysAgo(8) },
      { userId: providerUserId, type: "PROVIDER_VERIFIED",  title: "Hồ sơ đã được xác minh",     message: "Tài khoản nhà cung cấp của bạn đã được admin xác minh.", data: null,                                           readAt: daysAgo(7) },
      { userId: providerUserId, type: "DISPUTE_CREATED",    title: "Khách hàng tạo tranh chấp",  message: "Khách hàng đã tạo khiếu nại về dịch vụ gần đây.",  data: JSON.stringify({ bookingId: bookingDisputed.id }) },
    ],
  });

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n✅ Seed hoàn tất!\n");
  console.table(
    testUsers.map((u) => ({
      username: u.userName,
      password: TEST_PASSWORD,
      role: u.role,
      status: u.status,
    }))
  );
  console.log("\nBooking IDs seeded:");
  console.table([
    { status: "COMPLETED (cash)",   id: bookingCompleted.id },
    { status: "COMPLETED (online)", id: bookingCompletedOnline.id },
    { status: "PENDING",            id: bookingPending.id },
    { status: "CONFIRMED",          id: bookingConfirmed.id },
    { status: "CHECKED_IN",         id: bookingCheckedIn.id },
    { status: "CHECKED_OUT",        id: bookingCheckedOut.id },
    { status: "CANCELLED",          id: bookingCancelled.id },
    { status: "REJECTED",           id: bookingRejected.id },
    { status: "DISPUTE",            id: bookingDisputed.id },
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
