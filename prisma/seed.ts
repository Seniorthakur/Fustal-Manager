import { seedDatabase } from "../lib/db/seed-database";
import { prisma } from "../lib/db/prisma";

async function main() {
  await seedDatabase({ reset: process.env.SEED_RESET === "true" });
  console.log("Secure Prisma database is ready at DATABASE_URL.");
  console.log("Super Admin: owner / ChangeMe123!");
  console.log("Booking Admin: staff / StaffPass123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
