import prisma from "../connect.prisma.ts"

async function cleanDatabase() {
  console.log("Starting database cleanup...\n");

  try {
    // Delete all records from each model
    // Order matters if there are relations (delete children before parents)

    const deletedServices = await prisma.services.deleteMany({});
    const deletedDocuments = await prisma.provider_documents.deleteMany({});
    const deletedProviders = await prisma.providers.deleteMany({});
    const deletedUsers = await prisma.users.deleteMany({});
    console.log(`Deleted ${deletedServices.count} service(s)`);
    console.log(`Deleted ${deletedDocuments.count} provider document(s)`);
    console.log(`Deleted ${deletedProviders.count} provider(s)`);
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
