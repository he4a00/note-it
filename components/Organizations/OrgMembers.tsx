import Image from "next/image";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Trash, Users } from "lucide-react";
import { useRemoveMemberFromOrg } from "@/services/organizations/hooks/useOrganization";

const OrgMembers = ({
  memberId,
  orgId,
  memberImage,
  memberName,
  memberRole,
  memberEmail,
}: {
  memberId: string;
  orgId: string;
  memberImage: string;
  memberName: string;
  memberRole: string;
  memberEmail: string;
}) => {
  // Role badge color mapping
  const getRoleBadgeVariant = (role: string) => {
    switch (role.toUpperCase()) {
      case "OWNER":
        return "default";
      case "ADMIN":
        return "secondary";
      default:
        return "outline";
    }
  };

  const deleteMemberMutation = useRemoveMemberFromOrg();

  const handleRemoveMember = () => {
    deleteMemberMutation.mutate({
      orgId: orgId,
      userId: memberId,
    });
  };

  return (
    <div className="flex flex-col gap-5 bg-card rounded-xl border border-border p-6 shadow-sm">
      {/* Member Card */}
      <div className="flex flex-col gap-3">
        <div className="group flex flex-row items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 cursor-pointer">
          <div className="flex flex-row items-center gap-3">
            <div className="relative">
              <Image
                src={memberImage}
                alt={memberName}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover border-2 border-border group-hover:border-primary/50 transition-colors"
              />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background"></div>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {memberName}
              </h3>
              <p className="text-xs text-muted-foreground">{memberEmail}</p>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Badge
              variant={getRoleBadgeVariant(memberRole)}
              className="font-medium text-xs px-3 py-1"
            >
              {memberRole}
            </Badge>
            <Button
              onClick={handleRemoveMember}
              disabled={deleteMemberMutation.isPending}
              variant="ghost"
              size="sm"
            >
              <Trash color="red" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgMembers;
