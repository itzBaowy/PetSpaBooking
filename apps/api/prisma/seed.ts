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
    role: "CUSTOMER",
    status: "ACTIVE",
  },
  {
    userName: "provider_rejected",
    email: "provider.rejected@petlink.local",
    phone: "0900000005",
    fullName: "Provider Rejected",
    role: "CUSTOMER",
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
        description: "Hồ sơ dữ liệu mẫu dùng để kiểm tra luồng đăng nhập.",
        phone: "0901234567",
        email: `${providerCase.slug}@petlink.local`,
        address: "123 Nguyễn Trãi, Thành phố Hồ Chí Minh",
        taxCode: "0312345678",
        identityNumber: "079203001234",
        identityFullName: providerCase.businessName,
        bankCode: "VCB",
        bankAccountNumber: "0123456789",
        bankAccountName: providerCase.businessName.toUpperCase(),
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
              : "PENDING",
          adminNote: providerCase.adminNote,
        },
      ],
    });
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
