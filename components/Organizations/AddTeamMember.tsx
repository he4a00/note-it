import { Button } from "../ui/button";
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
import { useInviteMemberToOrg } from "@/services/organizations/hooks/useOrganization";
import { useGetAddTeamMember } from "@/services/teams/hooks/useTeams";

interface AddTeamMemberProps {
  teamId: string;
}

const inviteMemberSchema = z.object({
  email: z.email(),
  role: z.string(),
  teamId: z.string(),
});

const AddTeamMember = ({ teamId }: AddTeamMemberProps) => {
  const addTeamMemberMutation = useGetAddTeamMember({ teamId });
  const form = useForm<z.infer<typeof inviteMemberSchema>>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "",
      teamId: teamId,
    },
  });

  const onSubmit = (data: z.infer<typeof inviteMemberSchema>) => {
    addTeamMemberMutation.mutateAsync({
      email: data.email,
      role: data.role,
      teamId: data.teamId,
    });

    console.log(data);
  };
  return (
    <div className="space-y-6">
      <form
        id="add-member-team-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FieldGroup className="space-y-4">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="space-y-2">
                <FieldLabel className="text-sm font-medium">
                  Email Address
                </FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter email address"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="role"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="space-y-2">
                <FieldLabel className="text-sm font-medium">Role</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter role"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <div className="flex justify-end">
          <Button
            type="submit"
            form="add-member-team-form"
            // disabled={inviteMemeberMutation.isPending}
          >
            Send Invitation
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddTeamMember;
