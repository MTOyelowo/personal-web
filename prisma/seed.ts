import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: "Poetry", slug: "poetry", order: 0 },
  { name: "Article", slug: "article", order: 1 },
  { name: "Story", slug: "story", order: 2 },
  { name: "Essay", slug: "essay", order: 3 },
  { name: "Opinion", slug: "opinion", order: 4 },
  { name: "Thought", slug: "thought", order: 5 },
  { name: "Play", slug: "play", order: 6 },
  { name: "Picture", slug: "picture", order: 7 },
  { name: "Podcast", slug: "podcast", order: 8 },
];

async function main() {
  console.log("Seeding categories...");

  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, order: cat.order },
      create: cat,
    });
  }

  console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
