import prisma from "@/lib/db";
import { Note, OrganizationMember, TeamMember } from "./generated/prisma";

export type UserContext = {
  userId: string;
  orgMemberships: OrganizationMember[];
  teamMemberships: TeamMember[];
};

export type NotePermission = {
  canView: boolean;
  canComment: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export const getUserContext = async (userId: string): Promise<UserContext> => {
  const [orgMemberships, teamMemberships] = await Promise.all([
    prisma.organizationMember.findMany({
      where: { userId },
    }),
    prisma.teamMember.findMany({
      where: { userId },
    }),
  ]);

  return {
    userId,
    orgMemberships,
    teamMemberships,
  };
};

export const checkNotePermission = (
  note: Pick<Note, "userId" | "orgId" | "teamId" | "visibility">,
  context: UserContext
): NotePermission => {
  const { userId, orgId, teamId, visibility } = note;
  const { userId: currentUserId, orgMemberships, teamMemberships } = context;

  const isOwner = userId === currentUserId;

  // Default: No access
  let canView = false;
  let canComment = false;
  let canEdit = false;
  let canDelete = false;

  // 1. Owner has full access
  if (isOwner) {
    return { canView: true, canComment: true, canEdit: true, canDelete: true };
  }

  // 2. Private notes: Owner only (already handled)
  if (visibility === "PRIVATE") {
    return {
      canView: false,
      canComment: false,
      canEdit: false,
      canDelete: false,
    };
  }

  // 3. Organization permissions
  if (visibility === "ORG" && orgId) {
    const orgMember = orgMemberships.find((m) => m.orgId === orgId);
    if (orgMember) {
      canView = true;
      canComment = true;

      // Edit: Owner or Admin only
      if (orgMember.role === "OWNER" || orgMember.role === "ADMIN") {
        canEdit = true;
        canDelete = true;
      }
    }
  }

  // 4. Team permissions
  if (visibility === "TEAM" && teamId) {
    const teamMember = teamMemberships.find((m) => m.teamId === teamId);
    if (teamMember) {
      canView = true;
      canComment = true;

      // Edit: Team Lead
      // TeamMember role is a String in schema "LEAD", "DEV", "DESIGNER" (comment says so)
      if (teamMember.role === "LEAD") {
        canEdit = true;
        canDelete = true;
      }
    }
  }

  return {
    canView,
    canComment,
    canEdit,
    canDelete: canDelete || isOwner,
  };
};
