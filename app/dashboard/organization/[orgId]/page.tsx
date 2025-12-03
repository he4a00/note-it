import OrganizationPageClient from "@/components/Organizations/OrganizationPage";
import { prefetchOrgById } from "@/services/organizations/server/prefecth";
import { HydrateClient } from "@/trpc/server";

const OrganizationPage = async ({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) => {
  const { orgId } = await params;
  await prefetchOrgById(orgId);

  return (
    <HydrateClient>
      <OrganizationPageClient orgId={orgId} />
    </HydrateClient>
  );
};

export default OrganizationPage;
