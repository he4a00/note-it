"use client";

import {
  useGetAllActivities,
  useGetOrg,
} from "@/services/organizations/hooks/useOrganization";
import OrgHeader from "./OrgHeader";
import RecentActivities from "./RecentActivities";

const OrganizationPage = ({ orgId }: { orgId: string }) => {
  const org = useGetOrg(orgId);
  const activities = useGetAllActivities(orgId);
  console.log(activities.data);
  return (
    <div className="p-10">
      <OrgHeader
        orgId={org.data?.id || ""}
        orgName={org.data?.name || ""}
        image={org.data?.image || ""}
        orgSlug={org.data?.slug || ""}
        membersCount={org.data?.members.length || 0}
        createdAt={org.data?.createdAt || new Date()}
      />
      <div className="mt-8">
        <RecentActivities activities={activities.data || []} />
      </div>
    </div>
  );
};

export default OrganizationPage;
