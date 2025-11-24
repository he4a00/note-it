import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useSuspenseTags = () => {
  const trpc = useTRPC();
  return useQuery(trpc.tags.getAll.queryOptions());
};

export const useCreateTag = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.tags.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.tags.getAll.queryOptions());
      },
    })
  );
};
