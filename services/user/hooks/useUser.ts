import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetUser = (id: string) => {
  const trpc = useTRPC();
  return useQuery(trpc.user.getUser.queryOptions({ id }));
};

export const useUpdateUser = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.user.update.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.user.getUser.queryOptions({ id: data.id })
        );
      },
    })
  );
};
