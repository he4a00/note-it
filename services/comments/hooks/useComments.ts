import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCommentsForNote = ({ noteId }: { noteId: string }) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.comments.getForNote.queryOptions({
      noteId: noteId,
    })
  );
};

export const useCreateComment = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.comments.create.mutationOptions({
      onSuccess: (data) => {
        toast.success("Comment created successfully");
        queryClient.invalidateQueries(
          trpc.comments.getForNote.queryOptions({ noteId: data.noteId })
        );
        queryClient.invalidateQueries(trpc.notes.getAllNotes.queryOptions());
      },
    })
  );
};

export const useDeleteComment = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.comments.delete.mutationOptions({
      onSuccess: (data) => {
        toast.success("Comment deleted successfully");
        queryClient.invalidateQueries(
          trpc.comments.getForNote.queryOptions({ noteId: data.noteId })
        );
        queryClient.invalidateQueries(trpc.notes.getAllNotes.queryOptions());
      },
    })
  );
};

export const useUpdateComment = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.comments.update.mutationOptions({
      onSuccess: (data) => {
        toast.success("Comment updated successfully");
        queryClient.invalidateQueries(
          trpc.comments.getForNote.queryOptions({ noteId: data.noteId })
        );
        queryClient.invalidateQueries(trpc.notes.getAllNotes.queryOptions());
      },
    })
  );
};
