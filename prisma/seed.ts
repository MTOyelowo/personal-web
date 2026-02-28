import { PrismaClient } from "@/prisma/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
