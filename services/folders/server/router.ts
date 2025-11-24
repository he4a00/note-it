import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";

export const foldersRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.folder.create({
        data: {
          name: input.name,
          userId: ctx.auth.user.id,
        },
        include: {
          notes: true,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.folder.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),
  rename: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.folder.update({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        data: {
          name: input.name,
        },
      });
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.folder.findMany({
      where: {
        userId: ctx.auth.user.id,
      },
      include: {
        notes: true,
      },
    });
  }),
});
