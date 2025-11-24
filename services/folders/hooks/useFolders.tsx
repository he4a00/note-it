import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useSuspenseFolders = () => {
  const trpc = useTRPC();
  return useQuery(trpc.folders.getAll.queryOptions());
};

export const useCreateFolder = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.folders.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.folders.getAll.queryOptions());
      },
    })
  );
};
