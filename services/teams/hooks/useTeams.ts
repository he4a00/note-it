import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateTeam = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.teams.create.mutationOptions({
      onSuccess: (data) => {
        toast.success("Team created successfully");
        queryClient.invalidateQueries(
          trpc.teams.getAll.queryOptions({ orgId: data.orgId })
        );
      },
      onError: () => {
        toast.error("Failed to create team");
      },
    })
  );
};

export const useGetAllTeams = ({ orgId }: { orgId: string }) => {
  const trpc = useTRPC();
  return useQuery(trpc.teams.getAll.queryOptions({ orgId: orgId }));
};
