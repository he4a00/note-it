import { PrismaClient } from "./generated/prisma";

const globalFprPrisma = global as unknown as {
  prisma: PrismaClient;
};

const prisma = globalFprPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalFprPrisma.prisma = prisma;

export default prisma;
