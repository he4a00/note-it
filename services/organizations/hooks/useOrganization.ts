import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useCreateOrganization = () => {
  const trpc = useTRPC();
  const router = useRouter();
  return useMutation(
    trpc.organization.create.mutationOptions({
      onSuccess: (data) => {
        router.push(`/dashboard/organization/${data.id}`);
        toast.success("Organization created successfully");
      },
      onError: () => {
        toast.error("Failed to create organization");
      },
    })
  );
};

export const useGetMyOrgs = () => {
  const trpc = useTRPC();
  return useQuery(trpc.organization.getMyOrgs.queryOptions());
};

export const useGetOrg = (orgId: string) => {
  const trpc = useTRPC();
  return useQuery(trpc.organization.getOrgById.queryOptions({ id: orgId }));
};

export const useDeleteOrganization = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.organization.deleteOrg.mutationOptions({
      onSuccess: () => {
        toast.success("Organization deleted successfully");
        queryClient.invalidateQueries(
          trpc.organization.getMyOrgs.queryOptions()
        );
      },
      onError: () => {
        toast.error("Organization deletion failed");
      },
    })
  );
};

export const useGetAllActivities = (orgId: string) => {
  const trpc = useTRPC();
  return useQuery(trpc.organization.getAllActivities.queryOptions({ orgId }));
};
