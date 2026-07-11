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
  const customersByName = new Map<string, { id: string }>();

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

    if (user.role === "CUSTOMER") {
      const customer = await prisma.customers.upsert({
        where: { userId: savedUser.id },
        update: {},
        create: {
          userId: savedUser.id,
          location: "TP. Hồ Chí Minh",
        },
        select: { id: true },
      });
      customersByName.set(user.userName, customer);
    }
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

  const customer = customersByName.get("customer_test");
  const verifiedProvider = usersByName.get("provider_test");
  if (customer && verifiedProvider) {
    const provider = await prisma.providers.findUnique({
      where: { userId: verifiedProvider.id },
      select: { id: true },
    });

    if (provider) {
      await prisma.reviews.deleteMany({ where: { providerId: provider.id } });
      await prisma.bookings.deleteMany({
        where: { providerId: provider.id, customerId: customer.id },
      });
      const service = await prisma.services.findFirst({
        where: { providerId: provider.id, isActive: true },
        select: { id: true, price: true, duration: true },
      });
      if (!service) throw new Error("Missing seeded service for provider_test");

      const appointmentStart = new Date();
      const completedBooking = await prisma.bookings.create({
        data: {
          providerId: provider.id,
          customerId: customer.id,
          serviceId: service.id,
          appointmentStart,
          appointmentEnd: new Date(
            appointmentStart.getTime() + service.duration * 60 * 1000,
          ),
          status: "COMPLETED",
          paymentMethod: "CASH",
          paymentStatus: "UNPAID",
          totalAmount: service.price,
          currency: "VND",
          checkedOutAt: appointmentStart,
          completedAt: appointmentStart,
        },
        select: { id: true },
      });

      await prisma.reviews.createMany({
        data: [
          {
            bookingId: completedBooking.id,
            providerId: provider.id,
            customerId: customer.id,
            rating: 5,
            comment:
              "Dịch vụ rất chuyên nghiệp, thú cưng của tôi rất hài lòng.",
          },
        ],
      });
    }
  }

  if (customer) {
    await prisma.pets.deleteMany({ where: { customerId: customer.id } });
    await prisma.pets.create({
      data: {
        customerId: customer.id,
        name: "Bella",
        breed: "Golden Retriever",
        gender: "Cái",
        ageLabel: "3 tuổi",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCMBwJa2m0SA3QeppmAcW22QRlks3aUTNMP6sQkr3svQjcq7Al3Gae-aT8EjW5VpHUM5pi8BzCYnRzRt4fru9hRL90W6qoZehEa1m0B6DSvkfHVXFAbCSjABH4XBiiFvkImjWEirAqaUp5Tb0OaGLC0KQWWqVaT-FZtYLS4Pab5Uu3PsxvwSGp42zKzfgFGFj3t4PP6TmfLXGORUlzC27dKBAKWlP00IoleZnKjpruTFk17BGlBusmsXfgxuQwvikKhR-0lx4t5el1F",
        status: "active",
        weight: "30 kg",
        height: "55 cm",
        color: "Vàng kim",
        photos: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCMBwJa2m0SA3QeppmAcW22QRlks3aUTNMP6sQkr3svQjcq7Al3Gae-aT8EjW5VpHUM5pi8BzCYnRzRt4fru9hRL90W6qoZehEa1m0B6DSvkfHVXFAbCSjABH4XBiiFvkImjWEirAqaUp5Tb0OaGLC0KQWWqVaT-FZtYLS4Pab5Uu3PsxvwSGp42zKzfgFGFj3t4PP6TmfLXGORUlzC27dKBAKWlP00IoleZnKjpruTFk17BGlBusmsXfgxuQwvikKhR-0lx4t5el1F",
        ],
        nextVaccineDate: "12 Th12, 2024",
        healthReminder: {
          title: "Tiêm phòng dại",
          date: "12 Th12, 2024",
        },
        medicalRecords: [
          {
            id: "rec_bella_1",
            title: "Khám định kỳ",
            description: "Sức khỏe tốt, phát triển bình thường.",
            date: "10 Th10, 2024",
          },
        ],
      },
    });

    await prisma.pets.create({
      data: {
        customerId: customer.id,
        name: "Luna",
        breed: "Mèo Xiêm",
        gender: "Cái",
        ageLabel: "2 tuổi",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB9kpYBJk2Ua805d2WQOxXLrinqXV7BFTigb1GyWgHyezLochchY-TKbt1oOEKo4XuYIcZDJRFvJvlFFScCrXZLncseUC5WoTgUes2QH_C6a_m-MeCDOZKzYAFUtRWD0XzqP7vFgZCfJWTiokXwyGKls7tH31q3NqaDjvM_jMetDwT5A-zFhW7FK0YVRuvnQxwALOXgqcreJIl4d0rd0PjBKKBV7AowQoAHLwNAQbMoC6sK9CGx3Ybgz8_5IIkOUWP5GJFQ552rJpLr",
        status: "active",
        weight: "4 kg",
        height: "25 cm",
        color: "Trắng xám",
        photos: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB9kpYBJk2Ua805d2WQOxXLrinqXV7BFTigb1GyWgHyezLochchY-TKbt1oOEKo4XuYIcZDJRFvJvlFFScCrXZLncseUC5WoTgUes2QH_C6a_m-MeCDOZKzYAFUtRWD0XzqP7vFgZCfJWTiokXwyGKls7tH31q3NqaDjvM_jMetDwT5A-zFhW7FK0YVRuvnQxwALOXgqcreJIl4d0rd0PjBKKBV7AowQoAHLwNAQbMoC6sK9CGx3Ybgz8_5IIkOUWP5GJFQ552rJpLr",
        ],
        nextVaccineDate: "05 Th1, 2025",
        healthReminder: {
          title: "Tẩy giun định kỳ",
          date: "05 Th1, 2025",
        },
        medicalRecords: [
          {
            id: "rec_luna_1",
            title: "Tiêm vắc xin 4 bệnh",
            description: "Đã tiêm mũi 3 đầy đủ.",
            date: "15 Th08, 2024",
          },
        ],
      },
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
