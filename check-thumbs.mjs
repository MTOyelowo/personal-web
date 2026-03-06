import { PrismaClient } from "./prisma/generated/prisma/client.ts";

const p = new PrismaClient();
try {
  const posts = await p.post.findMany({
    where: { thumbnailUrl: { not: null } },
    select: { title: true, thumbnailUrl: true },
    take: 3,
  });
  console.log(JSON.stringify(posts, null, 2));
} catch (e) {
  console.error(e.message);
} finally {
  await p.$disconnect();
}
