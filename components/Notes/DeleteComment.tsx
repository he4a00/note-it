import React from "react";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
import { useDeleteComment } from "@/services/comments/hooks/useComments";

const DeleteComment = ({ commentId }: { commentId: string }) => {
  const deleteCommentMutation = useDeleteComment();

  const handleDelete = () => {
    deleteCommentMutation.mutateAsync({ id: commentId });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={deleteCommentMutation.isPending}
    >
      <Trash className="size-4" color="red" />
    </Button>
  );
};

export default DeleteComment;
