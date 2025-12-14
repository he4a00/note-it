"use client";

import { Button } from "../ui/button";
import { Send, Loader2, X } from "lucide-react";
import z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateComment } from "@/services/comments/hooks/useComments";
import { MentionsInput, Mention } from "react-mentions";
import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const EditCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(255, "Comment cannot exceed 255 characters"),
  commentId: z.string(),
});

interface EditCommentProps {
  commentId: string;
  content: string;
  onClose: () => void;
}

const mentionsStyle = {
  control: {
    backgroundColor: "hsl(var(--muted))",
    fontSize: 14,
    fontWeight: "normal",
    borderRadius: "0.5rem",
    border: "1px solid hsl(var(--border))",
  },
  "&multiLine": {
    control: {
      fontFamily: "inherit",
      minHeight: 80,
    },
    highlighter: {
      padding: 9,
      border: "1px solid transparent",
    },
    input: {
      padding: 9,
      border: "1px solid transparent",
      outline: "none",
    },
  },
  "&singleLine": {
    display: "inline-block",
    width: 180,
    highlighter: {
      padding: 1,
      border: "2px inset transparent",
    },
    input: {
      padding: 1,
      border: "2px inset",
    },
  },
  suggestions: {
    list: {
      backgroundColor: "hsl(var(--popover))",
      border: "1px solid hsl(var(--border))",
      fontSize: 14,
      borderRadius: 8,
      overflow: "hidden",
      boxShadow:
        "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      zIndex: 50,
    },
    item: {
      padding: "8px 10px",
      outline: "none",
      color: "hsl(var(--popover-foreground))",
      "&focused": {
        backgroundColor: "hsl(var(--accent))",
        color: "hsl(var(--accent-foreground))",
      },
    },
  },
};

const EditComment = ({ commentId, content, onClose }: EditCommentProps) => {
  const form = useForm<z.infer<typeof EditCommentSchema>>({
    resolver: zodResolver(EditCommentSchema),
    defaultValues: {
      content: content,
      commentId: commentId,
    },
  });

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const updateCommentMutation = useUpdateComment();

  const onSubmit = (data: z.infer<typeof EditCommentSchema>) => {
    updateCommentMutation.mutateAsync(
      {
        content: data.content,
        id: data.commentId,
      },
      {
        onSuccess: () => {
          form.reset();
          onClose();
        },
      }
    );
  };

  const currentContent = form.watch("content");
  const hasContent = currentContent.trim().length > 0;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="relative w-full">
      <Controller
        name="content"
        control={form.control}
        render={({ field }) => {
          return (
            <MentionsInput
              value={String(field.value || "")}
              onChange={(e, newValue) => field.onChange(newValue)}
              style={mentionsStyle}
              placeholder="Write a comment... Use @ to mention"
              className="min-h-[80px] resize-none text-sm placeholder:text-muted-foreground/60 w-full border rounded-lg focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent bg-muted/50 transition-all"
              autoFocus
            >
              <Mention
                trigger="@"
                markup="@[__display__]"
                data={async (query, callback) => {
                  if (query.trim().length === 0) return;
                  const users = await queryClient.fetchQuery(
                    trpc.user.searchUsers.queryOptions({ q: query })
                  );
                  callback(
                    users.map((u) => ({
                      id: u.id,
                      display: u.name || "Unknown",
                      image: u.image,
                    }))
                  );
                }}
                renderSuggestion={(suggestion: any) => (
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarImage src={suggestion.image} />
                      <AvatarFallback className="text-[10px]">
                        {suggestion.display.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {suggestion.display}
                    </span>
                  </div>
                )}
                displayTransform={(display) => `@${display}`}
                className="bg-primary/40 text-primary font-medium rounded-sm"
                appendSpaceOnAdd
              />
            </MentionsInput>
          );
        }}
      />

      <div className="flex items-center justify-end gap-2 mt-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={updateCommentMutation.isPending || !hasContent}
          className=" gap-2"
        >
          {updateCommentMutation.isPending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            "Save"
          )}
        </Button>
      </div>

      {form.formState.errors.content && (
        <p className="text-xs text-destructive mt-1">
          {form.formState.errors.content.message}
        </p>
      )}
    </form>
  );
};

export default EditComment;
