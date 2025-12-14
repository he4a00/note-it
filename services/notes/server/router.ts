import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { nanoid } from "nanoid";
import { getUserContext, checkNotePermission } from "@/lib/permissions";
import { TRPCError } from "@trpc/server";

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
      const note = await prisma.note.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        include: {
          folder: true,
          tags: true,
          org: true,
        },
      });

      const userContext = await getUserContext(ctx.auth.user.id);
      const permissions = checkNotePermission(note, userContext);

      if (!permissions.canView) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to view this note",
        });
      }

      return {
        ...note,
        permissions,
      };
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

      const userContext = await getUserContext(ctx.auth.user.id);
      const { orgMemberships, teamMemberships } = userContext;

      // Filter notes where:
      // 1. I am the owner
      // 2. OR visibility is ORG and I am in that Org
      // 3. OR visibility is TEAM and I am in that Team

      const orgIds = orgMemberships.map((m) => m.orgId);
      const teamIds = teamMemberships.map((m) => m.teamId);

      const notes = await prisma.note.findMany({
        where: {
          AND: [
            {
              OR: [
                { userId: ctx.auth.user.id },
                {
                  visibility: "ORG",
                  orgId: { in: orgIds },
                },
                {
                  visibility: "TEAM",
                  teamId: { in: teamIds },
                },
              ],
            },
            {
              folderId: folderId,
              isPinned: isPinned,
              isArchived: isArchived,
              isFavorite: isFavorite,
              tags: tagId ? { some: { id: tagId } } : undefined,
              OR: search
                ? [
                    { title: { contains: search, mode: "insensitive" } },
                    { content: { contains: search, mode: "insensitive" } },
                  ]
                : undefined,
            },
          ],
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

      return notes.map((note) => ({
        ...note,
        permissions: checkNotePermission(note, userContext),
      }));
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
      // 1. Fetch existing note to check permissions
      const existingNote = await prisma.note.findUniqueOrThrow({
        where: { id: input.id },
      });

      const userContext = await getUserContext(ctx.auth.user.id);
      const permissions = checkNotePermission(existingNote, userContext);

      if (!permissions.canEdit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to edit this note",
        });
      }

      const updatedNote = await prisma.note.update({
        where: {
          id: input.id,
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
          orgId: input.orgId === "" ? null : input.orgId,
        },
        include: {
          folder: true,
          tags: true,
          org: true,
        },
      });

      return {
        ...updatedNote,
        permissions: checkNotePermission(updatedNote, userContext),
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const note = await prisma.note.findUniqueOrThrow({
        where: { id: input.id },
      });

      const userContext = await getUserContext(ctx.auth.user.id);
      const permissions = checkNotePermission(note, userContext);

      if (!permissions.canDelete) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this note",
        });
      }

      return await prisma.note.delete({
        where: {
          id: input.id,
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

  bulkDelete: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      return await prisma.note.deleteMany({
        where: {
          id: {
            in: input,
          },
          userId: ctx.auth.user.id,
        },
      });
    }),

  bulkTogglePin: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      const note = await prisma.note.findMany({
        where: {
          id: {
            in: input,
          },
          userId: ctx.auth.user.id,
        },
        select: {
          isPinned: true,
        },
      });

      const updated = await prisma.note.updateMany({
        where: {
          id: {
            in: input,
          },
          userId: ctx.auth.user.id,
        },
        data: {
          isPinned: note[0].isPinned ? false : true,
        },
      });

      return updated;
    }),

  bulkToggleFavorite: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      const note = await prisma.note.findMany({
        where: {
          id: {
            in: input,
          },
          userId: ctx.auth.user.id,
        },
        select: {
          isFavorite: true,
        },
      });

      const updated = await prisma.note.updateMany({
        where: {
          id: {
            in: input,
          },
          userId: ctx.auth.user.id,
        },
        data: {
          isFavorite: note[0].isFavorite ? false : true,
        },
      });

      return updated;
    }),
});
