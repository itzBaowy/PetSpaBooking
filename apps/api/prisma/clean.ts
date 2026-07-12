import prisma from "../connect.prisma.ts"

async function cleanDatabase() {
  console.log("Starting database cleanup...\n");

  try {
    // Delete all records from each model
    // Order matters if there are relations (delete children before parents)

    const deletedReviews = await prisma.reviews.deleteMany({});
    const deletedPaymentTransactions =
      await prisma.payment_transactions.deleteMany({});
    const deletedPets = await prisma.pets.deleteMany({});
    const deletedServices = await prisma.services.deleteMany({});
    const deletedDocuments = await prisma.provider_documents.deleteMany({});
    const deletedAvailabilityBlocks =
      await prisma.provider_availability_blocks.deleteMany({});
    const deletedWorkingHours = await prisma.working_hours.deleteMany({});
    const deletedProviders = await prisma.providers.deleteMany({});
    const deletedCustomers = await prisma.customers.deleteMany({});
    const deletedUsers = await prisma.users.deleteMany({});
    console.log(`Deleted ${deletedReviews.count} review(s)`);
    console.log(
      `Deleted ${deletedPaymentTransactions.count} payment transaction(s)`,
    );
    console.log(`Deleted ${deletedPets.count} pet(s)`);
    console.log(`Deleted ${deletedServices.count} service(s)`);
    console.log(`Deleted ${deletedDocuments.count} provider document(s)`);
    console.log(
      `Deleted ${deletedAvailabilityBlocks.count} provider availability block(s)`,
    );
    console.log(`Deleted ${deletedWorkingHours.count} working hour(s)`);
    console.log(`Deleted ${deletedProviders.count} provider(s)`);
    console.log(`Deleted ${deletedCustomers.count} customer(s)`);
    console.log(`Deleted ${deletedUsers.count} user(s)`);

    console.log("\n🎉 Database cleaned successfully!");
  } catch (error) {
    console.error("Error cleaning database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected from database.");
  }
}

cleanDatabase();
