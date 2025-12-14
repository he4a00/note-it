import prisma from "@/lib/db";
import { extractMEntionsUserIds } from "@/lib/utils/mentions";
import { pusherServer } from "@/lib/pusher";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { getUserContext, checkNotePermission } from "@/lib/permissions";
import { TRPCError } from "@trpc/server";

export const commentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ content: z.string(), noteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const note = await prisma.note.findUniqueOrThrow({
        where: { id: input.noteId },
      });

      const userContext = await getUserContext(ctx.auth.user.id);
      const permissions = checkNotePermission(note, userContext);

      if (!permissions.canComment) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to comment on this note",
        });
      }

      const comment = await prisma.comment.create({
        data: {
          content: input.content,
          noteId: input.noteId,
          userId: ctx.auth.user.id,
        },
      });
      const mentionedUserIds = await extractMEntionsUserIds(input.content);

      // Create notifications for all mentioned users
      for (const userId of mentionedUserIds) {
        const notification = await prisma.notification.create({
          data: {
            type: "MENTIONED_IN_COMMENT",
            message: `${ctx.auth.user.name} mentioned you in a comment`,
            userId: userId,
            createdAt: new Date(),
            data: {
              commentId: comment.id,
              noteId: input.noteId,
            },
          },
          include: {
            user: true,
          },
        });

        // Trigger real-time notification via Pusher
        await pusherServer.trigger(
          `user-${userId}`,
          "new-notification",
          notification
        );
      }

      return comment;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const comment = await prisma.comment.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });

      return comment;
    }),

  getForNote: protectedProcedure
    .input(z.object({ noteId: z.string() }))
    .query(async ({ ctx, input }) => {
      const note = await prisma.note.findUniqueOrThrow({
        where: { id: input.noteId },
      });

      const userContext = await getUserContext(ctx.auth.user.id);
      const permissions = checkNotePermission(note, userContext);

      if (!permissions.canView) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to view comments for this note",
        });
      }

      const comments = await prisma.comment.findMany({
        where: {
          noteId: input.noteId,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return comments;
    }),
});
