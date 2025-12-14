"use client";

import { useCommentsForNote } from "@/services/comments/hooks/useComments";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Loader2, Trash, Edit2 } from "lucide-react";
import CreateComment from "./CreateComment";
import DeleteComment from "./DeleteComment";
import EditComment from "./EditComment";
import { Button } from "../ui/button";
import { useState } from "react";

interface CommentsPanelProps {
  noteId: string;
}

const CommentsPanel = ({ noteId }: CommentsPanelProps) => {
  const { data: comments, isLoading } = useCommentsForNote({ noteId });
  const [editingId, setEditingId] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full h-[80vh] flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 pb-5 border-b border-border/60">
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
          <MessageCircle className="size-4 text-primary" />
        </div>
        <h2 className="text-base font-semibold text-foreground">Comments</h2>
        {comments && comments.length > 0 && (
          <span className="ml-auto text-xs font-semibold size-6 flex items-center justify-center rounded-full bg-primary text-primary-foreground">
            {comments.length}
          </span>
        )}
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto py-5 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="group flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-150"
            >
              <Avatar className="size-8 shrink-0">
                <AvatarImage
                  src={comment.user.image || undefined}
                  alt={comment.user.name}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {getInitials(comment.user.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="font-semibold text-sm text-foreground">
                    {comment.user.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                {editingId === comment.id ? (
                  <EditComment
                    commentId={comment.id}
                    content={comment.content}
                    onClose={() => setEditingId(null)}
                  />
                ) : (
                  <p className="text-sm text-foreground/85 leading-relaxed break-words">
                    {comment.content}
                  </p>
                )}
              </div>
              {editingId !== comment.id && (
                <div className="flex flex-row items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteComment commentId={comment.id} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-primary"
                    onClick={() => setEditingId(comment.id)}
                  >
                    <Edit2 className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <div className="size-14 rounded-full bg-muted/70 flex items-center justify-center mb-4">
              <MessageCircle className="size-7 text-muted-foreground/70" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No comments yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Start the conversation below
            </p>
          </div>
        )}
      </div>

      {/* Create Comment Form */}
      <div className="pt-4 border-t border-border/60">
        <CreateComment noteId={noteId} />
      </div>
    </div>
  );
};

export default CommentsPanel;
