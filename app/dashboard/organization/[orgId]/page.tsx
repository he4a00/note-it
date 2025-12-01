import OrganizationPageClient from "@/components/Organizations/OrganizationPage";

const OrganizationPage = async ({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) => {
  const { orgId } = await params;
  return <OrganizationPageClient orgId={orgId} />;
};

export default OrganizationPage;
