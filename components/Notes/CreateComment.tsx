"use client";

import { Button } from "../ui/button";
import { Send, Loader2 } from "lucide-react";
import z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateComment } from "@/services/comments/hooks/useComments";
import { MentionsInput, Mention } from "react-mentions";
import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const AddCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(255, "Comment cannot exceed 255 characters"),
  noteId: z.string(),
});

const mentionsStyle = {
  control: {
    backgroundColor: "hsl(var(--muted) / 0.3)",
    fontSize: 14,
    fontWeight: "normal",
    borderRadius: "0.75rem",
    border: "1px solid hsl(var(--border) / 0.5)",
  },
  "&multiLine": {
    control: {
      fontFamily: "inherit",
      minHeight: 100,
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

const CreateComment = ({ noteId }: { noteId: string }) => {
  const form = useForm<z.infer<typeof AddCommentSchema>>({
    resolver: zodResolver(AddCommentSchema),
    defaultValues: {
      content: "",
      noteId: noteId,
    },
  });

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createCommentMutation = useCreateComment();

  const onSubmit = (data: z.infer<typeof AddCommentSchema>) => {
    createCommentMutation.mutateAsync(
      {
        content: data.content,
        noteId: data.noteId,
      },
      {
        onSuccess: () => {
          form.reset();
        },
      }
    );
  };

  const content = form.watch("content");
  const hasContent = content.trim().length > 0;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
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
              className="min-h-[100px] resize-none text-sm placeholder:text-muted-foreground/60 w-full border rounded"
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

      <Button
        type="submit"
        size="icon"
        disabled={createCommentMutation.isPending || !hasContent}
        className="absolute bottom-3 right-3 size-9 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 shadow-sm z-10"
      >
        {createCommentMutation.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
      </Button>
      {form.formState.errors.content && (
        <p className="text-xs text-destructive mt-2 pl-1">
          {form.formState.errors.content.message}
        </p>
      )}
    </form>
  );
};

export default CreateComment;
