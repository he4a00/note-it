import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";

export const notesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        folderId: z.string(),
        tagIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.note.create({
        data: {
          title: input.title,
          content: input.content,
          folderId: input.folderId,
          tags: {
            connect: input.tagIds?.map((tagId) => ({
              id: tagId,
            })),
          },
          userId: ctx.auth.user.id,
        },
      });
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await prisma.note.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        include: {
          folder: true,
          tags: true,
        },
      });
    }),

  getAll: protectedProcedure
    .input(
      z
        .object({
          folderId: z.string().optional(),
          tagId: z.string().optional(),
          isPinned: z.boolean().optional(),
          isArchived: z.boolean().optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { folderId, tagId, isPinned, isArchived, search } = input || {};

      return await prisma.note.findMany({
        where: {
          userId: ctx.auth.user.id,
          folderId: folderId,
          isPinned: isPinned,
          isArchived: isArchived,
          tags: tagId ? { some: { id: tagId } } : undefined,

          OR: search
            ? [
                { title: { contains: search, mode: "insensitive" } },
                { content: { contains: search, mode: "insensitive" } },
              ]
            : undefined,
        },
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          folder: true,
          tags: true,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
        folderId: z.string().nullable().optional(),
        tagIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.note.update({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        data: {
          title: input.title,
          content: input.content,
          folderId: input.folderId,
          tags: {
            set:
              input.tagIds?.map((tagId) => ({
                id: tagId,
              })) || [],
          },
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.note.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),

  togglePin: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const note = await prisma.note.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        select: {
          isPinned: true,
        },
      });

      return await prisma.note.update({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        data: {
          isPinned: !note.isPinned,
        },
      });
    }),
});
