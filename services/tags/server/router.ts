import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";

export const tagsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string(), color: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.tag.create({
        data: {
          name: input.name,
          color: input.color,
          userId: ctx.auth.user.id,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.tag.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),
  rename: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.tag.update({
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
    return await prisma.tag.findMany({
      where: {
        userId: ctx.auth.user.id,
      },
      include: {
        notes: true,
      },
    });
  }),
});
