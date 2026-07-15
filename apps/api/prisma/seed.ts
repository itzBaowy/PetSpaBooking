import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import type { Prisma } from "../generated/prisma/client.ts";
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

const demoProviderBusinessNames = [
  "Happy Paws Pet Spa",
  "Momo Pet Grooming",
  "Pawfect Care Studio",
  "Little Tails Spa",
  "Pet House Saigon",
  "Fluffy Friends Care",
  "Moonlight Pet Spa",
  "Sunny Paws Grooming",
  "Royal Pet Wellness",
  "Coco Pet Beauty",
  "Meow & Woof Spa",
  "Bông Xù Pet Care",
  "Sen Và Boss Spa",
  "Poodle House Grooming",
  "Golden Paws Center",
  "Pet Garden Wellness",
  "Lovely Tails Studio",
  "Happy Boss Pet Spa",
  "Milo Pet Care",
  "Luna Grooming House",
  "Tiny Paws Clinic",
  "Pet Home District 1",
  "Four Paws Wellness",
  "Buddy Pet Grooming",
  "Nắng Pet Spa",
  "Cloudy Paws Care",
  "The Pet Corner",
  "Paws & Relax Saigon",
  "Gentle Pet Studio",
  "Pet Haven Wellness",
] as const;

const demoProviderImages = [
  {
    avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80",
    cover: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1400&q=80",
  },
  {
    avatar: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=500&q=80",
    cover: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1400&q=80",
  },
  {
    avatar: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80",
    cover: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1400&q=80",
  },
  {
    avatar: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=500&q=80",
    cover: "https://images.unsplash.com/photo-1525253013412-55c1a69a5738?auto=format&fit=crop&w=1400&q=80",
  },
  {
    avatar: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=500&q=80",
    cover: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1400&q=80",
  },
  {
    avatar: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=500&q=80",
    cover: "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=1400&q=80",
  },
] as const;

const demoDistricts = [
  "Quận 1",
  "Quận 3",
  "Quận 5",
  "Quận 7",
  "Quận 10",
  "Quận Bình Thạnh",
  "Quận Phú Nhuận",
  "Thành phố Thủ Đức",
] as const;

const demoServiceCatalog = [
  {
    name: "Tắm thơm và sấy tạo kiểu",
    description: "Tắm bằng sản phẩm dịu nhẹ, sấy khô và chải tạo kiểu theo giống.",
    longDescription: "Quy trình gồm kiểm tra da lông, tắm hai bước, vệ sinh tai, sấy khô và chải hoàn thiện.",
    price: 180000,
    duration: 60,
    category: "GROOMING",
    targetPets: ["DOG", "CAT"],
    benefits: ["Làm sạch da lông", "Khử mùi dịu nhẹ", "Lông khô và mềm"],
    imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Cắt tỉa lông theo giống",
    description: "Tư vấn kiểu lông và cắt tỉa phù hợp với giống, thể trạng thú cưng.",
    longDescription: "Groomer trao đổi kiểu mong muốn, xử lý lông rối, cắt tạo hình và hoàn thiện vùng mặt, chân, đuôi.",
    price: 320000,
    duration: 90,
    category: "GROOMING",
    targetPets: ["DOG", "CAT"],
    benefits: ["Kiểu lông cân đối", "Giảm lông rối", "Dễ chăm sóc tại nhà"],
    imageUrl: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Spa thảo mộc thư giãn",
    description: "Liệu trình ngâm thảo mộc, massage và dưỡng lông cho thú cưng.",
    longDescription: "Liệu trình spa sử dụng sản phẩm phù hợp da nhạy cảm, kết hợp massage nhẹ và dưỡng ẩm bộ lông.",
    price: 390000,
    duration: 100,
    category: "SPA",
    targetPets: ["DOG", "CAT"],
    benefits: ["Thư giãn", "Dưỡng ẩm da", "Lông bóng mượt"],
    imageUrl: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Vệ sinh tai, móng và tuyến hôi",
    description: "Gói chăm sóc vệ sinh cơ bản dành cho chó mèo.",
    longDescription: "Nhân viên kiểm tra và vệ sinh tai, cắt mài móng, tỉa lông bàn chân và xử lý tuyến hôi an toàn.",
    price: 120000,
    duration: 35,
    category: "SPA",
    targetPets: ["DOG", "CAT"],
    benefits: ["Móng gọn sạch", "Tai được vệ sinh", "Giảm mùi khó chịu"],
    imageUrl: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Khách sạn thú cưng trong ngày",
    description: "Chăm sóc và lưu trú ban ngày trong khu vực sạch, có giám sát.",
    longDescription: "Thú cưng được bố trí khu riêng, theo dõi ăn uống, vận động và cập nhật hình ảnh cho chủ nuôi.",
    price: 280000,
    duration: 480,
    category: "BOARDING",
    targetPets: ["DOG", "CAT"],
    benefits: ["Có người giám sát", "Cập nhật tình trạng", "Không gian vệ sinh"],
    imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Lưu trú qua đêm",
    description: "Phòng lưu trú qua đêm có theo dõi và lịch sinh hoạt riêng.",
    longDescription: "Bao gồm chỗ ngủ riêng, cho ăn theo hướng dẫn, vệ sinh, vận động và báo cáo tình trạng mỗi ngày.",
    price: 450000,
    duration: 720,
    category: "BOARDING",
    targetPets: ["DOG", "CAT"],
    benefits: ["Theo dõi qua đêm", "Chăm sóc theo lịch", "Báo cáo hằng ngày"],
    imageUrl: "https://images.unsplash.com/photo-1525253013412-55c1a69a5738?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Huấn luyện vâng lời cơ bản",
    description: "Hướng dẫn các lệnh ngồi, chờ, đi cạnh và gọi quay lại.",
    longDescription: "Buổi học một kèm một sử dụng phương pháp củng cố tích cực và hướng dẫn chủ nuôi luyện tập tại nhà.",
    price: 350000,
    duration: 75,
    category: "TRAINING",
    targetPets: ["DOG"],
    benefits: ["Tăng khả năng tập trung", "Cải thiện giao tiếp", "Có bài tập tại nhà"],
    imageUrl: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Điều chỉnh hành vi chó con",
    description: "Đánh giá và xây dựng thói quen sinh hoạt phù hợp cho chó con.",
    longDescription: "Chuyên viên hướng dẫn đi vệ sinh đúng chỗ, kiểm soát cắn phá và làm quen môi trường xã hội.",
    price: 420000,
    duration: 90,
    category: "TRAINING",
    targetPets: ["DOG"],
    benefits: ["Nề nếp sinh hoạt", "Giảm cắn phá", "Tự tin hơn"],
    imageUrl: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Khám sức khỏe tổng quát",
    description: "Khám lâm sàng và tư vấn dinh dưỡng, tiêm phòng định kỳ.",
    longDescription: "Bác sĩ kiểm tra thể trạng, da lông, tai mắt, tim phổi và đưa ra khuyến nghị chăm sóc phù hợp.",
    price: 220000,
    duration: 45,
    category: "VETERINARY",
    targetPets: ["DOG", "CAT"],
    benefits: ["Phát hiện sớm bất thường", "Tư vấn dinh dưỡng", "Theo dõi sức khỏe"],
    imageUrl: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Tiêm phòng định kỳ",
    description: "Kiểm tra trước tiêm và thực hiện vaccine theo lịch chó mèo.",
    longDescription: "Bác sĩ rà soát lịch sử vaccine, khám sàng lọc, tiêm và hướng dẫn theo dõi phản ứng sau tiêm.",
    price: 260000,
    duration: 40,
    category: "VETERINARY",
    targetPets: ["DOG", "CAT"],
    benefits: ["Đúng lịch vaccine", "Khám sàng lọc", "Hướng dẫn sau tiêm"],
    imageUrl: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Chăm sóc răng miệng",
    description: "Vệ sinh răng miệng cơ bản và hướng dẫn chăm sóc tại nhà.",
    longDescription: "Kiểm tra khoang miệng, làm sạch mảng bám nhẹ và tư vấn sản phẩm vệ sinh phù hợp.",
    price: 240000,
    duration: 50,
    category: "OTHER",
    targetPets: ["DOG", "CAT"],
    benefits: ["Giảm mùi miệng", "Hạn chế mảng bám", "Có hướng dẫn tại nhà"],
    imageUrl: "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Đưa đón thú cưng nội thành",
    description: "Đưa đón thú cưng bằng phương tiện chuyên dụng trong khu vực nội thành.",
    longDescription: "Tài xế xác nhận thời gian, sử dụng lồng hoặc dây an toàn phù hợp và cập nhật khi đón, khi giao.",
    price: 150000,
    duration: 60,
    category: "OTHER",
    targetPets: ["DOG", "CAT"],
    benefits: ["Lịch đón rõ ràng", "Phương tiện an toàn", "Cập nhật hành trình"],
    imageUrl: "https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?auto=format&fit=crop&w=1000&q=80",
  },
] as const;

const demoCustomerProfiles = [
  ["customer_demo_01", "Nguyễn Minh Anh", "Quận 1", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"],
  ["customer_demo_02", "Trần Gia Bảo", "Quận 3", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"],
  ["customer_demo_03", "Lê Hoàng Yến", "Quận 7", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"],
  ["customer_demo_04", "Phạm Quốc Huy", "Quận Bình Thạnh", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"],
  ["customer_demo_05", "Võ Thanh Thảo", "Quận Phú Nhuận", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"],
  ["customer_demo_06", "Đặng Tuấn Kiệt", "Thành phố Thủ Đức", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80"],
  ["customer_demo_07", "Bùi Ngọc Mai", "Quận 10", "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80"],
  ["customer_demo_08", "Đỗ Đức Long", "Quận 5", "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=400&q=80"],
  ["customer_demo_09", "Hồ Khánh Linh", "Quận 7", "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80"],
  ["customer_demo_10", "Dương Nhật Nam", "Quận 1", "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80"],
  ["customer_demo_11", "Ngô Bảo Trâm", "Quận 3", "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80"],
  ["customer_demo_12", "Lý Minh Khang", "Quận Bình Thạnh", "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=400&q=80"],
].map(([userName, fullName, district, avatar], index) => ({
  userName,
  fullName,
  district,
  location: `${district}, TP. Hồ Chí Minh`,
  avatar,
  email: `${userName.split("_").join(".")}@petlink.local`,
  phone: `092200${String(index + 1).padStart(4, "0")}`,
}));

const demoProviders = demoProviderBusinessNames.map((businessName, index) => {
  const number = index + 1;
  const serial = String(number).padStart(2, "0");
  const image = demoProviderImages[index % demoProviderImages.length];
  const district = demoDistricts[index % demoDistricts.length];

  return {
    userName: `provider_demo_${serial}`,
    email: `provider.demo.${serial}@petlink.local`,
    phone: `091100${String(number).padStart(4, "0")}`,
    fullName: `Chủ spa ${businessName}`,
    businessName,
    slug: `petlink-demo-spa-${serial}`,
    description: `${businessName} cung cấp dịch vụ chăm sóc, làm đẹp và tư vấn sức khỏe thú cưng tại ${district}.`,
    avatarUrl: image.avatar,
    coverImageUrl: image.cover,
    address: `${20 + number} Nguyễn Văn Pet, ${district}, TP. Hồ Chí Minh`,
    ward: `Phường ${((number - 1) % 15) + 1}`,
    district,
    province: "TP. Hồ Chí Minh",
    lat: 10.73 + (index % 6) * 0.018,
    lng: 106.63 + (index % 8) * 0.016,
    taxCode: `0319${String(number).padStart(6, "0")}`,
    identityNumber: `079206${String(number).padStart(6, "0")}`,
    bankAccountNumber: `012345${String(number).padStart(4, "0")}`,
    providerStatus: "VERIFIED",
    depositStatus: "ACTIVE",
    depositBalance: 300000 + (index % 5) * 100000,
    walletBalance: 200000 + (index % 8) * 150000,
    adminNote: null,
    serviceImageUrls: [image.cover, image.avatar],
  } as const;
});

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
  ...demoProviders.map((provider) => ({
    userName: provider.userName,
    email: provider.email,
    phone: provider.phone,
    fullName: provider.fullName,
    role: "PROVIDER" as const,
    status: "ACTIVE" as const,
  })),
  ...demoCustomerProfiles.map((customer) => ({
    userName: customer.userName,
    email: customer.email,
    phone: customer.phone,
    fullName: customer.fullName,
    avatar: customer.avatar,
    role: "CUSTOMER" as const,
    status: "ACTIVE" as const,
  })),
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
    description: "PetLink Verified Spa chuyên grooming, spa thư giãn và chăm sóc sức khỏe toàn diện cho chó mèo.",
    avatarUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1400&q=80",
    serviceImageUrls: [
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1000&q=80",
    ],
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
  ...demoProviders,
] as const;

const systemSettings = [
  {
    key: "MIN_PROVIDER_DEPOSIT",
    value: 300000,
    description: "Minimum active provider deposit balance in VND.",
  },
  {
    key: "PLATFORM_COMMISSION_RATE",
    value: 0.15,
    description: "Platform commission rate from completed bookings.",
  },
  {
    key: "BOOKING_AUTO_COMPLETE_HOURS",
    value: 10,
    description: "Hold period in hours before CHECKED_OUT bookings auto-complete.",
  },
  {
    key: "BOOKING_NO_ARRIVAL_GRACE_MINUTES",
    value: 15,
    description: "Minutes after appointmentStart before provider can mark NO_ARRIVAL.",
  },
  {
    key: "MIN_WITHDRAWAL_AMOUNT",
    value: 100000,
    description: "Minimum provider withdrawal amount in VND.",
  },
] as const;

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const password = await bcrypt.hash(TEST_PASSWORD, 10);
  const usersByName = new Map<string, { id: string }>();
  const customersByName = new Map<string, { id: string }>();
  const customerLocationByName = new Map(
    demoCustomerProfiles.map((customer) => [customer.userName, customer.location]),
  );

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
  await prisma.system_settings.deleteMany({});

  // ── 1. Users ────────────────────────────────────────────────────────────────
  console.log("▶ Seeding users...");
  for (const user of testUsers) {
    const avatar = "avatar" in user ? user.avatar : undefined;
    const saved = await prisma.users.upsert({
      where: { userName: user.userName },
      update: {
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        password,
        role: user.role,
        status: user.status,
        ...(avatar ? { avatar } : {}),
      },
      create: { ...user, password },
      select: { id: true },
    });
    usersByName.set(user.userName, saved);

    if (user.role === "CUSTOMER") {
      const location = customerLocationByName.get(user.userName) ?? "TP. Hồ Chí Minh";
      const customer = await prisma.customers.upsert({
        where: { userId: saved.id },
        update: { location },
        create: { userId: saved.id, location },
        select: { id: true },
      });
      customersByName.set(user.userName, customer);
    }
  }

  // ── 1.1 System settings ───────────────────────────────────────────────────
  console.log("▶ Seeding system settings...");
  const adminUserForSettings = usersByName.get("admin_test")!;
  for (const setting of systemSettings) {
    await prisma.system_settings.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        description: setting.description,
        updatedBy: adminUserForSettings.id,
      },
      create: {
        key: setting.key,
        value: setting.value,
        description: setting.description,
        updatedBy: adminUserForSettings.id,
      },
    });
  }

  // ── 2. Providers ─────────────────────────────────────────────────────────────
  console.log("▶ Seeding providers...");
  const providersByName = new Map<string, { id: string }>();

  for (const [providerIndex, pc] of providerCases.entries()) {
    const user = usersByName.get(pc.userName)!;
    const description = "description" in pc
      ? pc.description
      : "Hồ sơ dữ liệu mẫu dùng để kiểm tra luồng đăng nhập và hiển thị dịch vụ thật.";
    const avatarUrl = "avatarUrl" in pc ? pc.avatarUrl : "/brand/petlink-logo.png";
    const coverImageUrl = "coverImageUrl" in pc ? pc.coverImageUrl : "/brand/petlink-logo.png";
    const phone = "phone" in pc ? pc.phone : "0901234567";
    const email = "email" in pc ? pc.email : `${pc.slug}@petlink.local`;
    const address = "address" in pc
      ? pc.address
      : "123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh";
    const ward = "ward" in pc ? pc.ward : "Phường Bến Nghé";
    const district = "district" in pc ? pc.district : "Quận 1";
    const province = "province" in pc ? pc.province : "TP. Hồ Chí Minh";
    const lat = "lat" in pc ? pc.lat : 10.7769;
    const lng = "lng" in pc ? pc.lng : 106.7009;
    const taxCode = "taxCode" in pc ? pc.taxCode : "0312345678";
    const identityNumber = "identityNumber" in pc ? pc.identityNumber : "079203001234";
    const bankAccountNumber = "bankAccountNumber" in pc
      ? pc.bankAccountNumber
      : "0123456789";
    const serviceImageUrls = "serviceImageUrls" in pc
      ? [...pc.serviceImageUrls]
      : ["/brand/petlink-logo.png"];

    const provider = await prisma.providers.upsert({
      where: { userId: user.id },
      update: {
        businessName: pc.businessName,
        slug: pc.slug,
        description,
        avatarUrl,
        coverImageUrl,
        phone,
        email,
        address,
        ward,
        district,
        province,
        lat,
        lng,
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
        description,
        avatarUrl,
        coverImageUrl,
        phone,
        email,
        address,
        ward,
        district,
        province,
        taxCode,
        identityNumber,
        identityFullName: pc.businessName,
        bankCode: "VCB",
        bankAccountNumber,
        bankAccountName: pc.businessName.toUpperCase(),
        lat,
        lng,
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
        { providerId: provider.id, documentType: "business_license", imageUrl: coverImageUrl, status: docStatus, adminNote: pc.adminNote },
        { providerId: provider.id, documentType: "id_card_front",    imageUrl: avatarUrl, status: docStatus, adminNote: pc.adminNote },
      ],
    });

    // Services
    await prisma.services.deleteMany({ where: { providerId: provider.id } });
    const providerServices = Array.from({ length: 4 }, (_, offset) =>
      demoServiceCatalog[(providerIndex + offset * 3) % demoServiceCatalog.length],
    );
    await prisma.services.createMany({
      data: providerServices.map((service, serviceIndex) => ({
        providerId: provider.id,
        name: service.name,
        description: service.description,
        longDescription: service.longDescription,
        price: service.price + (providerIndex % 4) * 20000,
        duration: service.duration,
        category: service.category,
        imageUrls: Array.from(
          new Set([
            service.imageUrl,
            serviceImageUrls[serviceIndex % serviceImageUrls.length],
          ]),
        ),
        targetPets: [...service.targetPets],
        benefits: [...service.benefits],
        isActive: pc.providerStatus === "VERIFIED",
        isHiddenByAdmin: false,
      })),
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

  // ── 5.1 Reviews for every verified provider ─────────────────────────────
  console.log("▶ Seeding provider social-proof reviews...");
  const reviewCustomers = demoCustomerProfiles.map((profile) => ({
    profile,
    customer: customersByName.get(profile.userName)!,
  }));
  const verifiedProviderCases = providerCases.filter(
    (providerCase) => providerCase.providerStatus === "VERIFIED",
  );
  const verifiedProviderIds = verifiedProviderCases.map(
    (providerCase) => providersByName.get(providerCase.userName)!.id,
  );
  const reviewServices = await prisma.services.findMany({
    where: {
      providerId: { in: verifiedProviderIds },
      isActive: true,
    },
    select: {
      id: true,
      providerId: true,
      price: true,
      duration: true,
      imageUrls: true,
    },
  });
  const servicesByProvider = new Map<string, typeof reviewServices>();
  for (const service of reviewServices) {
    const providerServices = servicesByProvider.get(service.providerId) ?? [];
    providerServices.push(service);
    servicesByProvider.set(service.providerId, providerServices);
  }

  const reviewComments = [
    "Nhân viên tư vấn kỹ, bé được chăm sóc nhẹ nhàng và đúng giờ.",
    "Không gian sạch sẽ, dịch vụ chuyên nghiệp, mình sẽ quay lại.",
    "Bé về nhà thơm tho, lông mềm và không bị căng thẳng.",
    "Provider cập nhật tình trạng thường xuyên nên mình rất yên tâm.",
    "Đặt lịch thuận tiện, tiếp nhận nhanh và kết quả đúng mong đợi.",
    "Giá hợp lý so với chất lượng, nhân viên thân thiện với thú cưng.",
    "Quy trình rõ ràng, có dặn dò cách chăm sóc tại nhà rất chi tiết.",
    "Dịch vụ tốt, chỉ chờ hơi lâu một chút vào giờ cao điểm.",
  ] as const;
  const reviewRatings = [5, 5, 4, 5, 4, 5, 3, 4] as const;
  const socialBookingRows: Prisma.bookingsCreateManyInput[] = [];
  const socialReviewRows: Prisma.reviewsCreateManyInput[] = [];

  verifiedProviderCases.forEach((providerCase, providerIndex) => {
    const providerId = providersByName.get(providerCase.userName)!.id;
    const providerServices = servicesByProvider.get(providerId) ?? [];
    if (providerServices.length === 0) {
      throw new Error(`Missing active services for ${providerCase.userName}`);
    }

    for (let reviewIndex = 0; reviewIndex < 5; reviewIndex += 1) {
      const reviewer = reviewCustomers[
        (providerIndex * 3 + reviewIndex) % reviewCustomers.length
      ];
      const service = providerServices[reviewIndex % providerServices.length];
      const bookingId = new ObjectId().toHexString();
      const appointmentStart = daysAgo(
        12 + ((providerIndex * 5 + reviewIndex) % 120),
      );
      const appointmentEnd = new Date(
        appointmentStart.getTime() + service.duration * 60 * 1000,
      );
      const completedAt = new Date(appointmentEnd.getTime() + 10 * 60 * 60 * 1000);
      const paymentMethod = reviewIndex % 2 === 0 ? "ONLINE" : "CASH";
      const commissionAmount = service.price * 0.15;

      socialBookingRows.push({
        id: bookingId,
        customerId: reviewer.customer.id,
        providerId,
        serviceId: service.id,
        appointmentStart,
        appointmentEnd,
        status: "COMPLETED",
        paymentMethod,
        paymentStatus: paymentMethod === "ONLINE" ? "SUCCESS" : "UNPAID",
        paymentReference:
          paymentMethod === "ONLINE" ? `seed-review-payment-${bookingId}` : null,
        paidAt: paymentMethod === "ONLINE" ? appointmentStart : null,
        totalAmount: service.price,
        currency: "VND",
        note: `Seed review booking by ${reviewer.profile.userName}`,
        confirmedAt: new Date(appointmentStart.getTime() - 60 * 60 * 1000),
        checkedInAt: appointmentStart,
        checkedOutAt: appointmentEnd,
        completedAt,
        commissionAmount,
        providerEarning: service.price - commissionAmount,
        walletCommissionAmount: paymentMethod === "CASH" ? commissionAmount : 0,
        depositCommissionAmount: 0,
        commissionProcessedAt: completedAt,
        createAt: new Date(appointmentStart.getTime() - 24 * 60 * 60 * 1000),
      });

      socialReviewRows.push({
        bookingId,
        providerId,
        customerId: reviewer.customer.id,
        rating: reviewRatings[(providerIndex + reviewIndex) % reviewRatings.length],
        comment:
          reviewComments[(providerIndex * 2 + reviewIndex) % reviewComments.length],
        images:
          reviewIndex % 3 === 0 && service.imageUrls[0]
            ? [service.imageUrls[0]]
            : [],
        createAt: new Date(completedAt.getTime() + 2 * 60 * 60 * 1000),
      });
    }
  });

  await prisma.bookings.createMany({ data: socialBookingRows });
  await prisma.reviews.createMany({ data: socialReviewRows });

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
