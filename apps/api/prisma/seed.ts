import prisma from "../connect.prisma.ts"

async function main() { 
    await prisma.users.create({
        data: {
            userName: "john_doe",
            password: "hashed_password",
            email: "john.doe@example.com",
            phone: "1234567890"
        }
    });
    console.log("Seed data inserted successfully.");
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});