"use client";

import {
  useGetAllActivities,
  useGetOrg,
} from "@/services/organizations/hooks/useOrganization";
import OrgHeader from "./OrgHeader";
import RecentActivities from "./RecentActivities";
import { Group, Loader2, Users } from "lucide-react";
import { useOrganizationsParams } from "@/services/organizations/hooks/use-organizations-params";
import OrgMembers from "./OrgMembers";
import { useGetAllTeams } from "@/services/teams/hooks/useTeams";
import Teams from "./Teams";
import { Button } from "../ui/button";
import OrganizationNotes from "./OrganizationNotes";

const OrganizationPage = ({ orgId }: { orgId: string }) => {
  const org = useGetOrg(orgId);
  const activities = useGetAllActivities(orgId);
  const teams = useGetAllTeams({ orgId: orgId });
  const [params, setParams] = useOrganizationsParams();

  if (org.isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 color="orange" className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  const orgNotes = (org.data?.notes || []).map((note) => ({
    id: note.id,
    type: note.type as "NOTE" | "TEMPLATE",
    title: note.title,
    content: note.content,
    isPinned: note.isPinned,
    isFavorite: note.isFavorite,
    updatedAt: note.updatedAt,
    tags: note.tags || [],
  }));

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10">
      <OrgHeader
        orgId={org.data?.id || ""}
        orgName={org.data?.name || ""}
        image={org.data?.image || ""}
        orgSlug={org.data?.slug || ""}
        membersCount={org.data?.members.length || 0}
        createdAt={org.data?.createdAt || new Date()}
      />

      <div className="mt-4 sm:mt-6 md:mt-8">
        <RecentActivities
          activities={activities.data?.items || []}
          page={activities.data?.page || 1}
          totalPages={activities.data?.totalPages || 1}
          onPageChange={(page) => setParams({ ...params, page })}
          isLoading={activities.isLoading}
        />
      </div>
      <div className="w-full flex md:flex-row flex-col container mx-auto mt-6 sm:mt-8 md:mt-10 lg:mt-12 gap-6 sm:gap-8 md:gap-10">
        <div className="flex-2 flex flex-col gap-3 sm:gap-4 md:gap-5">
          <div className="flex flex-row items-center mb-1 justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Group className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg sm:text-xl font-semibold">Teams</h2>
            </div>
          </div>
          {teams.data?.length === 0 && (
            <p className="text-center text-gray-500">No teams found</p>
          )}
          {teams.data?.map((team) => (
            <Teams
              key={team.id}
              teamName={team.name || ""}
              teamDescription={team.description || ""}
              teamCount={team.members.length}
              teamId={team.id}
            />
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-3 sm:gap-4 md:gap-5">
          <div className="flex flex-row items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg sm:text-xl font-semibold">Members</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="hover:underline hover:bg-transparent dark:hover:bg-transparent text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View All ({org.data?.members.length})
            </Button>
          </div>
          {org.data?.members.length === 0 && (
            <p className="text-center text-gray-500">No members found</p>
          )}
          {org.data?.members.map((member) => (
            <OrgMembers
              key={member.id}
              memberImage={member.user.image || ""}
              memberName={member.user.name || ""}
              memberRole={member.role || ""}
              memberEmail={member.user.email || ""}
              memberId={member.user.id}
              orgId={orgId}
            />
          ))}
        </div>
      </div>
      {/* Organization Notes Section */}
      <div className="mt-6 sm:mt-8 md:mt-10">
        <OrganizationNotes notes={orgNotes} maxDisplay={4} />
      </div>
    </div>
  );
};

export default OrganizationPage;
