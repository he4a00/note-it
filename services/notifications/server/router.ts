import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import prisma from "@/lib/db";

export const notificationsRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;
      const { cursor } = input;

      const items = await prisma.notification.findMany({
        take: limit + 1,
        where: {
          userId: ctx.auth.user.id,
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.notification.count({
      where: {
        userId: ctx.auth.user.id,
        isRead: false,
      },
    });
  }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.notification.update({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        data: {
          isRead: true,
        },
      });
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    return await prisma.notification.updateMany({
      where: {
        userId: ctx.auth.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }),
});
