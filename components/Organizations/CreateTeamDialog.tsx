"use client";

import { Users } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogFooter, DialogTrigger } from "../ui/dialog";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "../ui/input";
import { useCreateTeam } from "@/services/teams/hooks/useTeams";
import { Textarea } from "../ui/textarea";
import { useState } from "react";

const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, "Team name is required")
    .min(3, "Team name must be at least 3 characters"),
  description: z.string().optional(),
  orgId: z.string(),
});

const CreateTeamDialog = ({ orgId }: { orgId: string }) => {
  const [open, setOpen] = useState(false);
  const createTeamMutation = useCreateTeam();
  const form = useForm<z.infer<typeof createTeamSchema>>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      description: "",
      orgId: orgId,
    },
  });

  const onSubmit = async (data: z.infer<typeof createTeamSchema>) => {
    try {
      await createTeamMutation.mutateAsync({
        name: data.name,
        description: data.description,
        orgId: orgId,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to create team:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline">
          <Users /> Create Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Team</DialogTitle>
          <DialogDescription>
            Create a new team to organize members and projects
          </DialogDescription>
        </DialogHeader>
        <form
          id="create-team-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <FieldGroup className="space-y-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="space-y-2">
                  <FieldLabel className="text-sm font-medium">
                    Team Name *
                  </FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter team name"
                    autoComplete="off"
                    className="h-10 border-2 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="space-y-2">
                  <FieldLabel className="text-sm font-medium">
                    Description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter team description"
                    autoComplete="off"
                    className="min-h-20 border-2 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter className="flex flex-row gap-3">
          <DialogClose asChild>
            <Button
              variant="outline"
              type="button"
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="create-team-form"
            disabled={createTeamMutation.isPending}
          >
            {createTeamMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeamDialog;
