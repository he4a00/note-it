import { PAGINATION } from "@/constants";
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
          members: {
            create: {
              userId: ctx.auth.user.id,
              role: "OWNER",
            },
          },
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
        OR: [
          { ownerId: ctx.auth.user.id },
          { members: { some: { userId: ctx.auth.user.id } } },
        ],
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
          members: {
            include: {
              user: true,
            },
          },
          teams: true,
          owner: true,
          notes: {
            include: {
              user: true,
              tags: true,
            },
          },
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
    .mutation(async ({ input }) => {
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
    .mutation(async ({ ctx, input }) => {
      const org = await prisma.organization.findUnique({
        where: { id: input.id },
        select: { name: true },
      });

      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      // Delete team members first
      const teams = await prisma.team.findMany({
        where: { orgId: input.id },
        select: { id: true },
      });

      for (const team of teams) {
        await prisma.teamMember.deleteMany({
          where: { teamId: team.id },
        });
      }

      // Delete teams
      await prisma.team.deleteMany({
        where: { orgId: input.id },
      });

      // Update notes to remove org association (set orgId to null)
      await prisma.note.updateMany({
        where: { orgId: input.id },
        data: { orgId: null },
      });

      // Delete organization members
      await prisma.organizationMember.deleteMany({
        where: { orgId: input.id },
      });

      // Finally, delete the organization
      const deletedOrg = await prisma.organization.delete({
        where: { id: input.id },
      });

      return deletedOrg;
    }),

  addMemberToOrg: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
        email: z.string(),
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

      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const organization = await prisma.organization.findUnique({
        where: { id: input.orgId },
        select: { ownerId: true, name: true },
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

      const orgMember = await prisma.organizationMember.create({
        data: {
          orgId: input.orgId,
          userId: user.id,
          role: input.role,
        },
      });

      await prisma.activity.create({
        data: {
          action: "MEMBER_ADDED_TO_ORG",
          userId: ctx.auth.user.id,
          orgId: input.orgId,
          entityId: user.id,
          entityType: "USER",
          metadata: `${ctx.auth.user.name} added ${user.name} to ${organization?.name} organization`,
        },
      });

      await prisma.notification.create({
        data: {
          type: "MEMBER_ADDED_TO_ORG",
          message: `${ctx.auth.user.name} added you to ${organization?.name} organization as ${input.role}`,
          userId: user.id, // The user who is being added
          createdAt: new Date(),
          data: {
            orgId: input.orgId,
            userId: user.id,
            role: input.role,
          },
        },
      });

      return orgMember;
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
        select: { ownerId: true, name: true },
      });

      const user = await prisma.user.findUnique({
        where: { id: input.userId },
      });

      const isOwner = organization?.ownerId === ctx.auth.user.id;
      const isAdmin = currentUserMembership?.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only organization owners and admins can remove members",
        });
      }

      const deletedOrg = await prisma.organizationMember.delete({
        where: {
          orgId_userId: {
            orgId: input.orgId,
            userId: input.userId,
          },
        },
      });

      await prisma.activity.create({
        data: {
          action: "MEMBER_REMOVED_FROM_ORG",
          userId: ctx.auth.user.id,
          orgId: input.orgId,
          entityId: input.userId,
          entityType: "USER",
          metadata: `${ctx.auth.user.name} removed ${user?.name} from ${organization?.name} organization`,
        },
      });

      await prisma.notification.create({
        data: {
          type: "MEMBER_REMOVED_FROM_ORG",
          message: `${ctx.auth.user.name} removed you from ${organization?.name} organization`,
          userId: input.userId, // The user who is being removed
          createdAt: new Date(),
          data: {
            orgId: input.orgId,
            userId: input.userId,
          },
        },
      });

      return deletedOrg;
    }),

  getAllActivities: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
      })
    )
    .query(async ({ ctx, input }) => {
      const [items, totalCount] = await Promise.all([
        prisma.activity.findMany({
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
          where: {
            orgId: input.orgId,
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: true,
          },
        }),
        prisma.activity.count({
          where: {
            orgId: input.orgId,
          },
        }),
      ]);
      const totalPages = Math.ceil(totalCount / input.pageSize);
      const hasNextPage = input.page < totalPages;
      const hasPreviousPage = input.page > 1;

      return {
        items,
        page: input.page,
        pageSize: input.pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),
});
