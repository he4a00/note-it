import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useOrganizationsParams } from "./use-organizations-params";

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
  const [params] = useOrganizationsParams();
  return useQuery(
    trpc.organization.getAllActivities.queryOptions({ orgId, ...params })
  );
};

export const useInviteMemberToOrg = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.organization.addMemberToOrg.mutationOptions({
      onSuccess: (data) => {
        toast.success("Member added successfully");
        queryClient.invalidateQueries(
          trpc.organization.getAllActivities.queryOptions({
            orgId: data.orgId,
          })
        );
        queryClient.invalidateQueries(
          trpc.organization.getOrgById.queryOptions({
            id: data.orgId,
          })
        );
      },
      onError: () => {
        toast.error("Failed to invite member");
      },
    })
  );
};

export const useRemoveMemberFromOrg = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.organization.removeMemeberFromOrg.mutationOptions({
      onSuccess: (data) => {
        toast.success("Member removed successfully");
        queryClient.invalidateQueries(
          trpc.organization.getAllActivities.queryOptions({
            orgId: data.orgId,
          })
        );
        queryClient.invalidateQueries(
          trpc.organization.getOrgById.queryOptions({
            id: data.orgId,
          })
        );
      },
      onError: () => {
        toast.error("Failed to remove member");
      },
    })
  );
};
