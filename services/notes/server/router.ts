import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";

export const notesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        folderId: z.string().nullable().optional(),
        type: z.enum(["NOTE", "TEMPLATE"]),
        tagIds: z.array(z.string()).optional(),
        userId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.note.create({
        data: {
          title: input.title,
          content: input.content,
          ...(input.folderId && {
            folder: {
              connect: {
                id: input.folderId,
              },
            },
          }),
          type: input.type,
          tags: {
            connect: input.tagIds?.map((tagId) => ({
              id: tagId,
            })),
          },
          user: {
            connect: {
              id: ctx.auth.user.id || input.userId,
            },
          },
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

  getAllNotes: protectedProcedure
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
          // type: "NOTE",

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
        type: z.enum(["NOTE", "TEMPLATE"]).optional(),
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
          type: input.type,
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

  getAllTemplates: protectedProcedure
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
          folderId: folderId,
          isPinned: isPinned,
          isArchived: isArchived,
          tags: tagId ? { some: { id: tagId } } : undefined,
          type: "TEMPLATE",
          userId: {
            not: ctx.auth.user.id,
          },
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
          user: true,
        },
      });
    }),
});
