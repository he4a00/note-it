import { Group, Users } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import ManageTeam from "./ManageTeam";

interface TeamsProps {
  teamName: string;
  teamDescription: string;
  teamCount: number;
  teamId: string;
}

const Teams = ({
  teamName,
  teamDescription,
  teamCount,
  teamId,
}: TeamsProps) => {
  return (
    <div className="flex flex-col gap-5 bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="group flex flex-row items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 cursor-pointer">
          <div className="flex flex-row items-center gap-3">
            <div className="relative">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background"></div>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {teamName}
              </h3>
              <p className="text-xs text-muted-foreground">{teamDescription}</p>
            </div>
          </div>
          <Badge variant="outline">{teamCount} Members</Badge>
        </div>
      </div>
      <ManageTeam teamId={teamId} />
    </div>
  );
};

export default Teams;
