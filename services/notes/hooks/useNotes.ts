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
      onSuccess: (data) => {
        toast.success("Note created successfully");
        queryClient.invalidateQueries(trpc.notes.getAllNotes.queryOptions());
        queryClient.invalidateQueries(
          trpc.organization.getOrgById.queryOptions({ id: data.org?.id ?? "" })
        );
      },
      onError: () => {
        toast.error("Note creation failed");
      },
    })
  );
};

export const useSuspenseNotes = (
  filters?: RouterInputs["notes"]["getAllNotes"]
) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.notes.getAllNotes.queryOptions(filters));
};

export const useSuspenseTemplates = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.notes.getAllTemplates.queryOptions());
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
        queryClient.invalidateQueries(trpc.notes.getAllNotes.queryOptions());
        queryClient.invalidateQueries(
          trpc.notes.getAllTemplates.queryOptions()
        );
      },
      onError: () => {
        toast.error("Note deletion failed");
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
        queryClient.invalidateQueries(trpc.notes.getAllNotes.queryOptions());
        queryClient.invalidateQueries(
          trpc.notes.getAllTemplates.queryOptions()
        );
        queryClient.invalidateQueries(
          trpc.notes.getOne.queryOptions({ id: data.id })
        );
        queryClient.invalidateQueries(
          trpc.organization.getOrgById.queryOptions({ id: data.org?.id ?? "" })
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
        queryClient.invalidateQueries(trpc.notes.getAllNotes.queryOptions());
        queryClient.invalidateQueries(
          trpc.notes.getAllTemplates.queryOptions()
        );
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

export const useToggleFavoriteNote = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.notes.toggleFavorite.mutationOptions({
      onSuccess: (data) => {
        toast.success("Note favorited successfully");
        queryClient.invalidateQueries(trpc.notes.getAllNotes.queryOptions());
        queryClient.invalidateQueries(
          trpc.notes.getAllTemplates.queryOptions()
        );
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

export const useTogglePublicShare = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.notes.togglePublicShare.mutationOptions({
      onSuccess: (data) => {
        toast.success("Note shared successfully");
        queryClient.invalidateQueries(trpc.notes.getAllNotes.queryOptions());
        queryClient.invalidateQueries(
          trpc.notes.getAllTemplates.queryOptions()
        );
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
