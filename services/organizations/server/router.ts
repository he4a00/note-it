import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const organizationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        slug: z.string().optional(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newOrg = await prisma.organization.create({
        data: {
          name: input.name,
          slug: input.slug,
          image: input.image,
          ownerId: ctx.auth.user.id,
        },
      });

      await prisma.activity.create({
        data: {
          action: "ORG_CREATED",
          userId: ctx.auth.user.id,
          orgId: newOrg.id,
          entityId: newOrg.id,
          entityType: "ORG",
          metadata: `${ctx.auth.user.name} created ${newOrg.name} organization`,
        },
      });

      return newOrg;
    }),

  getMyOrgs: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.organization.findMany({
      where: {
        ownerId: ctx.auth.user.id,
      },
      include: {
        members: true,
        teams: true,
        owner: true,
        notes: true,
      },
    });
  }),

  getOrgById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await prisma.organization.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        include: {
          members: true,
          teams: true,
          owner: true,
          notes: true,
        },
      });
    }),

  updateOrgById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.organization.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          slug: input.slug,
        },
      });
    }),

  deleteOrg: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await prisma.organization.delete({
        where: {
          id: input.id,
        },
      });
    }),

  addMemberToOrg: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
        userId: z.string(),
        role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserMembership = await prisma.organizationMember.findUnique({
        where: {
          orgId_userId: {
            orgId: input.orgId,
            userId: ctx.auth.user.id,
          },
        },
      });

      const organization = await prisma.organization.findUnique({
        where: { id: input.orgId },
        select: { ownerId: true },
      });

      const isOwner = organization?.ownerId === ctx.auth.user.id;
      const isAdmin = currentUserMembership?.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only organization owners and admins can add members",
        });
      }

      // Prevent non-owners from adding OWNER role
      if (input.role === "OWNER" && !isOwner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the organization owner can assign the OWNER role",
        });
      }

      return await prisma.organizationMember.create({
        data: {
          orgId: input.orgId,
          userId: input.userId,
          role: input.role,
        },
      });
    }),

  removeMemeberFromOrg: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserMembership = await prisma.organizationMember.findUnique({
        where: {
          orgId_userId: {
            orgId: input.orgId,
            userId: ctx.auth.user.id,
          },
        },
      });

      const organization = await prisma.organization.findUnique({
        where: { id: input.orgId },
        select: { ownerId: true },
      });

      const isOwner = organization?.ownerId === ctx.auth.user.id;
      const isAdmin = currentUserMembership?.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only organization owners and admins can remove members",
        });
      }

      return await prisma.organizationMember.delete({
        where: {
          orgId_userId: {
            orgId: input.orgId,
            userId: input.userId,
          },
        },
      });
    }),

  getAllActivities: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await prisma.activity.findMany({
        where: {
          orgId: input.orgId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: true,
        },
      });
    }),
});
