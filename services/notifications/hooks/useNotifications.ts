import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetAllNotifications = () => {
  const trpc = useTRPC();
  return useQuery(
    trpc.notifications.getAll.queryOptions({
      limit: 10,
      cursor: undefined,
    })
  );
};

export const useMarkAsRead = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.notifications.markAsRead.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.notifications.getAll.queryOptions({})
        );
        queryClient.invalidateQueries(
          trpc.notifications.getUnreadCount.queryOptions()
        );
      },
    })
  );
};

export const useMarkAllAsRead = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.notifications.markAllAsRead.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.notifications.getAll.queryOptions({})
        );
        queryClient.invalidateQueries(
          trpc.notifications.getUnreadCount.queryOptions()
        );
      },
    })
  );
};
