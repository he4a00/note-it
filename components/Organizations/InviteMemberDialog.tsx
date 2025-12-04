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
import { toast } from "sonner";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useInviteMemberToOrg } from "@/services/organizations/hooks/useOrganization";

interface InviteMemberDialogProps {
  orgId: string;
  type?: "EDIT" | "CREATE";
}

const inviteMemberSchema = z.object({
  email: z.email(),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
  orgId: z.string(),
});

const InviteMemberDialog = ({ orgId, type }: InviteMemberDialogProps) => {
  const inviteMemeberMutation = useInviteMemberToOrg();
  const form = useForm<z.infer<typeof inviteMemberSchema>>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "MEMBER",
      orgId: orgId,
    },
  });

  const onSubmit = (data: z.infer<typeof inviteMemberSchema>) => {
    inviteMemeberMutation.mutateAsync({
      email: data.email,
      role: data.role,
      orgId: orgId,
    });
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="">
          <Users /> Invite Members
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Invite a member to your organization
          </DialogDescription>
        </DialogHeader>
        <form
          id="invite-member-form"
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
                    className="h-10 border-2 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectTrigger className="h-10 border-2 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OWNER">Owner</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MEMBER">Member</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter className="flex flex-row gap-3">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="invite-member-form"
            disabled={inviteMemeberMutation.isPending}
          >
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberDialog;
