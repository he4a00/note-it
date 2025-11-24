import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { inferRouterInputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";
import { toast } from "sonner";

type RouterInputs = inferRouterInputs<AppRouter>;

export const useCreateNote = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.notes.create.mutationOptions({
      onSuccess: () => {
        toast.success("Note created successfully");
        queryClient.invalidateQueries(trpc.notes.getAll.queryOptions());
      },
      onError: (error) => {
        toast.error("Note creation failed");
      },
    })
  );
};

export const useSuspenseNotes = (filters?: RouterInputs["notes"]["getAll"]) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.notes.getAll.queryOptions(filters));
};

export const useGetNote = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(
    trpc.notes.getOne.queryOptions({
      id,
    })
  );
};

export const useNote = (id?: string) => {
  const trpc = useTRPC();

  return useQuery(
    trpc.notes.getOne.queryOptions(
      {
        id: id ?? "",
      },
      {
        enabled: !!id,
      }
    )
  );
};

export const useDeleteNote = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.notes.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Note deleted successfully");
        queryClient.invalidateQueries(trpc.notes.getAll.queryOptions());
      },
      onError: (error) => {
        console.log(error);
      },
    })
  );
};

export const useUpdateNote = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.notes.update.mutationOptions({
      onSuccess: (data) => {
        console.log(data);
        queryClient.invalidateQueries(trpc.notes.getAll.queryOptions());
        queryClient.invalidateQueries(
          trpc.notes.getOne.queryOptions({ id: data.id })
        );
      },
      onError: (error) => {
        console.log(error);
      },
    })
  );
};

export const useTogglePinNote = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.notes.togglePin.mutationOptions({
      onSuccess: (data) => {
        toast.success("Note pinned successfully");
        queryClient.invalidateQueries(trpc.notes.getAll.queryOptions());
        queryClient.invalidateQueries(
          trpc.notes.getOne.queryOptions({ id: data.id })
        );
      },
      onError: (error) => {
        console.log(error);
      },
    })
  );
};
