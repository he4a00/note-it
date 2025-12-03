import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";

export const teamsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
        name: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.team.create({
        data: {
          name: input.name,
          description: input.description,
          orgId: input.orgId,
        },
        include: {
          org: true,
          members: true,
        },
      });
    }),

  getAll: protectedProcedure
    .input(z.object({ orgId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await prisma.team.findMany({
        where: {
          orgId: input.orgId,
        },
        include: {
          org: true,
          members: true,
        },
      });
    }),

  //   getOne: protectedProcedure
  //     .input(z.object({ id: z.string() }))
  //     .query(async ({ ctx, input }) => {
  //       return await prisma.team.findUnique({
  //         where: {
  //           id: input.id,
  //         },
  //       });
  //     }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.team.delete({
        where: {
          id: input.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.team.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }),
});
