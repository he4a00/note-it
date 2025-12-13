import prisma from "../db";

const MENTION_REGEX = /@([a-zA-Z0-9_\\-\\.]+)/g;

export async function extractMEntionsUserIds(text: string) {
  const names = new Set<string>();
  let m;
  while ((m = MENTION_REGEX.exec(text)) !== null) {
    names.add(m[1]);
  }
  if (names.size === 0) return [];
  const users = await prisma.user.findMany({
    where: { name: { in: Array.from(names) } },
    select: { id: true },
  });
  return users.map((u) => u.id);
}
