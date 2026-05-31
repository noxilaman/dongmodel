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

async function main() {
  for (const name of collectibleKinds) {
    await prisma.collectibleKind.upsert({
      where: { name },
      update: { isActive: true },
      create: { name }
    });
  }

  console.log(`Seeded ${collectibleKinds.length} collectible kinds.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
