import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { nanoid } from "nanoid";

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
        orgId: z.string().nullable().optional(),
        visibility: z.enum(["PRIVATE", "ORG", "TEAM"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const note = await prisma.note.create({
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
          visibility: input.visibility,
          ...(input.orgId && {
            org: {
              connect: {
                id: input.orgId,
              },
            },
          }),
        },
        include: {
          folder: true,
          tags: true,
          org: true,
        },
      });

      return note;
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
          org: true,
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
          isFavorite: z.boolean().optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { folderId, tagId, isPinned, isArchived, isFavorite, search } =
        input || {};

      return await prisma.note.findMany({
        where: {
          userId: ctx.auth.user.id,
          folderId: folderId,
          isPinned: isPinned,
          isArchived: isArchived,
          isFavorite: isFavorite,
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
          org: true,
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
        visibility: z.enum(["PRIVATE", "ORG", "TEAM"]).optional(),
        orgId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedNote = await prisma.note.update({
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
          visibility: input.visibility,
          orgId: input.orgId,
        },
        include: {
          folder: true,
          tags: true,
          org: true,
        },
      });

      return updatedNote;
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

  toggleFavorite: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const note = await prisma.note.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        select: {
          isFavorite: true,
        },
      });

      return await prisma.note.update({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        data: {
          isFavorite: !note.isFavorite,
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
          isFavorite: z.boolean().optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { folderId, tagId, isPinned, isArchived, isFavorite, search } =
        input || {};

      return await prisma.note.findMany({
        where: {
          folderId: folderId,
          isPinned: isPinned,
          isArchived: isArchived,
          isFavorite: isFavorite,
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

  togglePublicShare: protectedProcedure
    .input(z.object({ id: z.string(), isPublic: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const note = await prisma.note.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        select: {
          shareId: true,
        },
      });

      if (!note) {
        throw new Error("Note not found");
      }

      if (input.isPublic) {
        const newShareId = note.shareId ?? nanoid(16);
        const updated = await prisma.note.update({
          where: {
            id: input.id,
            userId: ctx.auth.user.id,
          },
          data: {
            visibility: "PUBLIC",
            shareId: newShareId,
          },
        });

        return updated;
      } else {
        const updated = await prisma.note.update({
          where: {
            id: input.id,
            userId: ctx.auth.user.id,
          },
          data: {
            visibility: "PRIVATE",
            shareId: null,
          },
        });

        return updated;
      }
    }),
});
