import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
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

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await prisma.team.findUnique({
        where: {
          id: input.id,
        },
        include: {
          members: {
            include: {
              team: true,
              user: true,
            },
          },
          org: {
            include: {
              teams: true,
              members: true,
            },
          },
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
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

  addTeamMember: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        email: z.email(),
        role: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // check first the role of the one that is going to add members

      const team = await prisma.team.findUniqueOrThrow({
        where: {
          id: input.teamId,
        },
        include: {
          org: true,
        },
      });

      if (team.org.ownerId !== ctx.auth.user.id) {
        const orgMember = await prisma.organizationMember.findUniqueOrThrow({
          where: {
            orgId_userId: {
              orgId: team.orgId,
              userId: ctx.auth.user.id,
            },
          },
        });

        if (orgMember.role !== "OWNER" && orgMember.role !== "ADMIN") {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You are not allowed to add team members",
          });
        }
      }

      const user = await prisma.user.findUniqueOrThrow({
        where: {
          email: input.email,
        },
      });
      // create the team member

      const newTeamMember = await prisma.teamMember.create({
        data: {
          teamId: input.teamId,
          userId: user.id,
          role: input.role,
        },
        include: {
          team: true,
        },
      });
      // push a notification to the added user

      await prisma.notification.create({
        data: {
          type: "TEAM_MEMBER_ADDED",
          message: "You have been added to a team",
          data: {
            teamId: input.teamId,
            userId: user.id,
            role: input.role,
          },
          userId: user.id,
        },
      });
      // create an activity that this user added a member to the team

      await prisma.activity.create({
        data: {
          action: "TEAM_MEMBER_ADDED",
          userId: ctx.auth.user.id,
          orgId: team.orgId,
          entityId: user.id,
          entityType: "USER",
          metadata: `${ctx.auth.user.name} added ${user?.name} to ${team?.name} team`,
        },
      });

      return newTeamMember;
    }),

  removeMemberTeam: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // check first the role of the one that is going to remove members

      const team = await prisma.team.findUniqueOrThrow({
        where: {
          id: input.teamId,
        },
        include: {
          org: true,
        },
      });

      if (team.org.ownerId !== ctx.auth.user.id) {
        const orgMember = await prisma.organizationMember.findUniqueOrThrow({
          where: {
            orgId_userId: {
              orgId: team.orgId,
              userId: ctx.auth.user.id,
            },
          },
        });

        if (orgMember.role !== "OWNER" && orgMember.role !== "ADMIN") {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You are not allowed to remove team members",
          });
        }
      }

      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: input.userId,
        },
      });
      // remove the team member

      const removedTeamMember = await prisma.teamMember.delete({
        where: {
          teamId_userId: {
            teamId: input.teamId,
            userId: input.userId,
          },
        },
      });
      // push a notification to the removed user

      await prisma.notification.create({
        data: {
          type: "TEAM_MEMBER_REMOVED",
          message: "You have been removed from a team",
          data: {
            teamId: input.teamId,
            userId: input.userId,
          },
          userId: input.userId,
        },
      });
      // create an activity that this user removed a member from the team

      await prisma.activity.create({
        data: {
          action: "TEAM_MEMBER_REMOVED",
          userId: ctx.auth.user.id,
          orgId: team.orgId,
          entityId: input.userId,
          entityType: "USER",
          metadata: `${ctx.auth.user.name} removed ${user?.name} from ${team?.name} team`,
        },
      });

      return removedTeamMember;
    }),
});
