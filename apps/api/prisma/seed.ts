import bcrypt from "bcrypt";
import prisma from "../connect.prisma.ts";

const TEST_PASSWORD = "Test@123";

const testUsers = [
  {
    userName: "admin_test",
    email: "admin.test@petlink.local",
    phone: "0900000001",
    fullName: "Admin Test",
    role: "ADMIN",
    status: "ACTIVE",
  },
  {
    userName: "provider_test",
    email: "provider.test@petlink.local",
    phone: "0900000002",
    fullName: "Provider Verified",
    role: "PROVIDER",
    status: "ACTIVE",
  },
  {
    userName: "customer_test",
    email: "customer.test@petlink.local",
    phone: "0900000003",
    fullName: "Customer Test",
    role: "CUSTOMER",
    status: "ACTIVE",
  },
  {
    userName: "provider_pending",
    email: "provider.pending@petlink.local",
    phone: "0900000004",
    fullName: "Provider Pending",
    role: "PROVIDER",
    status: "ACTIVE",
  },
  {
    userName: "provider_rejected",
    email: "provider.rejected@petlink.local",
    phone: "0900000005",
    fullName: "Provider Rejected",
    role: "PROVIDER",
    status: "ACTIVE",
  },
  {
    userName: "provider_suspended",
    email: "provider.suspended@petlink.local",
    phone: "0900000006",
    fullName: "Provider Suspended",
    role: "PROVIDER",
    status: "ACTIVE",
  },
  {
    userName: "johndoe",
    email: "johndoe@gmail.com",
    phone: "0909999876",
    fullName: "John Doe",
    role: "CUSTOMER",
    status: "ACTIVE",
  },
] as const;

const providerCases = [
  {
    userName: "provider_test",
    businessName: "PetLink Verified Spa",
    slug: "petlink-verified-spa",
    providerStatus: "VERIFIED",
    adminNote: null,
  },
  {
    userName: "provider_pending",
    businessName: "PetLink Pending Spa",
    slug: "petlink-pending-spa",
    providerStatus: "PENDING_VERIFICATION",
    adminNote: null,
  },
  {
    userName: "provider_rejected",
    businessName: "PetLink Rejected Spa",
    slug: "petlink-rejected-spa",
    providerStatus: "REJECTED",
    adminNote: "Giấy phép kinh doanh chưa rõ. Vui lòng tải lại tài liệu.",
  },
  {
    userName: "provider_suspended",
    businessName: "PetLink Suspended Spa",
    slug: "petlink-suspended-spa",
    providerStatus: "SUSPENDED",
    adminNote: "Tài khoản nhà cung cấp đang tạm khóa để kiểm tra vi phạm.",
  },
] as const;

async function main() {
  const password = await bcrypt.hash(TEST_PASSWORD, 10);
  const usersByName = new Map<string, { id: string }>();

  for (const user of testUsers) {
    const savedUser = await prisma.users.upsert({
      where: { userName: user.userName },
      update: {
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        password,
        role: user.role,
        status: user.status,
      },
      create: {
        ...user,
        password,
      },
      select: { id: true },
    });

    usersByName.set(user.userName, savedUser);
  }

  for (const providerCase of providerCases) {
    const user = usersByName.get(providerCase.userName);
    if (!user) throw new Error(`Missing seeded user: ${providerCase.userName}`);

    const provider = await prisma.providers.upsert({
      where: { userId: user.id },
      update: {
        businessName: providerCase.businessName,
        slug: providerCase.slug,
        providerStatus: providerCase.providerStatus,
        adminNote: providerCase.adminNote,
      },
      create: {
        userId: user.id,
        businessName: providerCase.businessName,
        slug: providerCase.slug,
        description:
          "Hồ sơ dữ liệu mẫu dùng để kiểm tra luồng đăng nhập và hiển thị dịch vụ thật.",
        avatarUrl: "/brand/petlink-logo.png",
        coverImageUrl: "/brand/petlink-logo.png",
        phone: "0901234567",
        email: `${providerCase.slug}@petlink.local`,
        address: "123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh",
        ward: "Phường Bến Nghé",
        district: "Quận 1",
        province: "TP. Hồ Chí Minh",
        taxCode: "0312345678",
        identityNumber: "079203001234",
        identityFullName: providerCase.businessName,
        bankCode: "VCB",
        bankAccountNumber: "0123456789",
        bankAccountName: providerCase.businessName.toUpperCase(),
        lat: 10.7769,
        lng: 106.7009,
        providerStatus: providerCase.providerStatus,
        adminNote: providerCase.adminNote,
      },
      select: { id: true },
    });

    await prisma.provider_documents.deleteMany({
      where: { providerId: provider.id },
    });
    await prisma.provider_documents.createMany({
      data: [
        {
          providerId: provider.id,
          documentType: "business_license",
          imageUrl: "/brand/petlink-logo.png",
          status:
            providerCase.providerStatus === "VERIFIED"
              ? "APPROVED"
              : providerCase.providerStatus === "REJECTED"
                ? "REJECTED"
                : "PENDING",
          adminNote: providerCase.adminNote,
        },
        {
          providerId: provider.id,
          documentType: "id_card_front",
          imageUrl: "/brand/petlink-logo.png",
          status:
            providerCase.providerStatus === "VERIFIED"
              ? "APPROVED"
              : providerCase.providerStatus === "REJECTED"
                ? "REJECTED"
                : "PENDING",
          adminNote: providerCase.adminNote,
        },
      ],
    });

    await prisma.services.deleteMany({
      where: { providerId: provider.id },
    });
    await prisma.services.createMany({
      data: [
        {
          providerId: provider.id,
          name: `${providerCase.businessName} - Tắm & làm đẹp`,
          description: "Dịch vụ tắm, cắt tỉa lông và chăm sóc da cho thú cưng.",
          longDescription:
            "Dịch vụ tắm và làm đẹp toàn diện cho thú cưng bao gồm tắm bằng sữa tắm chuyên dụng, sấy khô, cắt tỉa lông tạo kiểu, vệ sinh tai và cắt móng. Đội ngũ chuyên nghiệp của chúng tôi sẽ mang lại diện mạo sạch sẽ và thoải mái nhất cho bé yêu của bạn.",
          price: 250000,
          duration: 60,
          category: "GROOMING",
          imageUrls: ["/brand/petlink-logo.png"],
          targetPets: ["DOG", "CAT"],
          benefits: [
            "Lông mượt thơm tho",
            "Sạch ve rận bụi bẩn",
            "Diện mạo xinh xắn tạo kiểu chuẩn spa",
          ],
          isActive: true,
          isHiddenByAdmin: false,
        },
        {
          providerId: provider.id,
          name: `${providerCase.businessName} - Tiêm phòng`,
          description: "Dịch vụ tiêm phòng và tư vấn sức khỏe định kỳ.",
          longDescription:
            "Dịch vụ tiêm ngừa các loại vắc-xin thiết yếu cho chó mèo (như vắc-xin dại, vắc-xin đa bệnh) và kiểm tra sức khỏe tổng quát trước khi tiêm. Bác sĩ thú y trực tiếp tư vấn lộ trình và theo dõi sức khỏe sau tiêm.",
          price: 180000,
          duration: 45,
          category: "VETERINARY",
          imageUrls: ["/brand/petlink-logo.png"],
          targetPets: ["DOG", "CAT"],
          benefits: [
            "Tăng cường hệ miễn dịch",
            "Phòng chống các bệnh truyền nhiễm nguy hiểm",
            "Tư vấn sức khỏe miễn phí",
          ],
          isActive: providerCase.providerStatus === "VERIFIED",
          isHiddenByAdmin: false,
        },
      ],
    });

    await prisma.working_hours.deleteMany({
      where: { providerId: provider.id },
    });
    await prisma.working_hours.createMany({
      data: [
        {
          providerId: provider.id,
          dayOfWeek: 1,
          openTime: "08:00",
          closeTime: "18:00",
          isClosed: false,
        },
        {
          providerId: provider.id,
          dayOfWeek: 2,
          openTime: "08:00",
          closeTime: "18:00",
          isClosed: false,
        },
        {
          providerId: provider.id,
          dayOfWeek: 3,
          openTime: "08:00",
          closeTime: "18:00",
          isClosed: false,
        },
        {
          providerId: provider.id,
          dayOfWeek: 4,
          openTime: "08:00",
          closeTime: "18:00",
          isClosed: false,
        },
        {
          providerId: provider.id,
          dayOfWeek: 5,
          openTime: "08:00",
          closeTime: "18:00",
          isClosed: false,
        },
        {
          providerId: provider.id,
          dayOfWeek: 6,
          openTime: "09:00",
          closeTime: "17:00",
          isClosed: false,
        },
        {
          providerId: provider.id,
          dayOfWeek: 0,
          openTime: "10:00",
          closeTime: "16:00",
          isClosed: true,
        },
      ],
    });
  }

  const customer = usersByName.get("customer_test");
  const verifiedProvider = usersByName.get("provider_test");
  if (customer && verifiedProvider) {
    const provider = await prisma.providers.findUnique({
      where: { userId: verifiedProvider.id },
      select: { id: true },
    });

    if (provider) {
      await prisma.reviews.deleteMany({ where: { providerId: provider.id } });
      await prisma.reviews.createMany({
        data: [
          {
            providerId: provider.id,
            userId: customer.id,
            rating: 5,
            comment:
              "Dịch vụ rất chuyên nghiệp, thú cưng của tôi rất hài lòng.",
          },
        ],
      });
    }
  }

  console.table(
    testUsers.map((user) => ({
      username: user.userName,
      password: TEST_PASSWORD,
      role: user.role,
      expected:
        user.userName === "admin_test"
          ? "/admin"
          : user.userName === "provider_test"
            ? "/provider"
            : user.userName === "customer_test"
              ? "Không có quyền, gợi ý đăng ký Provider"
              : "/provider-verification",
    })),
  );
}

main()
  .then(async () => {
    console.log("Seed dữ liệu kiểm thử đăng nhập thành công.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
