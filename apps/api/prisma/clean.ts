import prisma from "../connect.prisma.ts"

async function cleanDatabase() {
  console.log("Starting database cleanup...\n");

  try {
    // Delete all records from each model
    // Order matters if there are relations (delete children before parents)

    const deletedUsers = await prisma.users.deleteMany({});
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
