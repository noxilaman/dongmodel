const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const collectibleKinds = [
  "Gunpla",
  "Figure",
  "Board Game",
  "Toy",
  "Model Kit",
  "Book/Manga",
  "Game",
  "อื่น ๆ"
];

function parseAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function main() {
  for (const name of collectibleKinds) {
    await prisma.collectibleKind.upsert({
      where: { name },
      update: { isActive: true },
      create: { name }
    });
  }

  console.log(`Seeded ${collectibleKinds.length} collectible kinds.`);

  const adminEmails = parseAdminEmails();
  if (adminEmails.length === 0) {
    console.log("No ADMIN_EMAILS configured; skipped admin bootstrap.");
    return;
  }

  const result = await prisma.owner.updateMany({
    where: { email: { in: adminEmails } },
    data: { role: "ADMIN" }
  });

  const foundAdmins = await prisma.owner.findMany({
    where: { email: { in: adminEmails } },
    select: { email: true }
  });
  const foundEmailSet = new Set(foundAdmins.map((owner) => owner.email.toLowerCase()));
  const missingEmails = adminEmails.filter((email) => !foundEmailSet.has(email));

  console.log(`Promoted ${result.count} owner(s) to ADMIN from ADMIN_EMAILS.`);
  if (missingEmails.length > 0) {
    console.log(
      `Admin bootstrap skipped missing owner email(s): ${missingEmails.join(", ")}. Register them first, then run prisma:seed again.`
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
