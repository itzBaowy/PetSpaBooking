import prisma from "../connect.prisma.ts";

type DeleteResult = {
  count: number;
};

type CleanupStep = {
  label: string;
  deleteMany: () => Promise<DeleteResult>;
};

async function cleanDatabase() {
  console.log("Starting database cleanup...\n");

  const cleanupSteps: CleanupStep[] = [
    // Booking/chat side effects must be removed before their parent booking/user rows.
    {
      label: "chat message",
      deleteMany: () => prisma.chat_messages.deleteMany({}),
    },
    {
      label: "chat thread",
      deleteMany: () => prisma.chat_threads.deleteMany({}),
    },
    {
      label: "booking QR log",
      deleteMany: () => prisma.booking_qr_logs.deleteMany({}),
    },
    {
      label: "booking dispute",
      deleteMany: () => prisma.booking_disputes.deleteMany({}),
    },
    {
      label: "review",
      deleteMany: () => prisma.reviews.deleteMany({}),
    },
    {
      label: "commission record",
      deleteMany: () => prisma.commission_records.deleteMany({}),
    },
    {
      label: "wallet transaction",
      deleteMany: () => prisma.wallet_transactions.deleteMany({}),
    },
    {
      label: "payment transaction",
      deleteMany: () => prisma.payment_transactions.deleteMany({}),
    },
    {
      label: "withdrawal request",
      deleteMany: () => prisma.withdrawal_requests.deleteMany({}),
    },
    {
      label: "notification",
      deleteMany: () => prisma.notifications.deleteMany({}),
    },
    {
      label: "admin audit log",
      deleteMany: () => prisma.admin_audit_logs.deleteMany({}),
    },
    {
      label: "booking",
      deleteMany: () => prisma.bookings.deleteMany({}),
    },

    // Provider/customer child data.
    {
      label: "pet",
      deleteMany: () => prisma.pets.deleteMany({}),
    },
    {
      label: "service",
      deleteMany: () => prisma.services.deleteMany({}),
    },
    {
      label: "provider document",
      deleteMany: () => prisma.provider_documents.deleteMany({}),
    },
    {
      label: "provider availability block",
      deleteMany: () => prisma.provider_availability_blocks.deleteMany({}),
    },
    {
      label: "working hour",
      deleteMany: () => prisma.working_hours.deleteMany({}),
    },

    // Root profile/account data.
    {
      label: "provider",
      deleteMany: () => prisma.providers.deleteMany({}),
    },
    {
      label: "customer",
      deleteMany: () => prisma.customers.deleteMany({}),
    },
    {
      label: "user",
      deleteMany: () => prisma.users.deleteMany({}),
    },
    {
      label: "system setting",
      deleteMany: () => prisma.system_settings.deleteMany({}),
    },
  ];

  try {
    for (const step of cleanupSteps) {
      const deleted = await step.deleteMany();
      console.log(`Deleted ${deleted.count} ${step.label}(s)`);
    }

    console.log("\nDatabase cleaned successfully!");
  } catch (error) {
    console.error("Error cleaning database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected from database.");
  }
}

cleanDatabase();
