import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";

export const userRouter = createTRPCRouter({
  getUser: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx }) => {
      return await prisma.user.findUniqueOrThrow({
        where: {
          id: ctx.auth.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.user.update({
        where: {
          id: ctx.auth.user.id,
        },
        data: {
          name: input.name,
          image: input.image,
        },
      });
    }),

  searchUsers: protectedProcedure
    .input(z.object({ q: z.string().min(1) }))
    .query(async ({ input }) => {
      const q = input.q;
      return prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, image: true },
        take: 10,
      });
    }),
});
