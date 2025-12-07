import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Edit2, Plus, Settings, Trash, Users } from "lucide-react";
import AddTeamMember from "./AddTeamMember";
import { useDeleteTeam, useGetTeam } from "@/services/teams/hooks/useTeams";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";

const ManageTeam = ({ teamId }: { teamId: string }) => {
  const team = useGetTeam({ teamId });
  const lead = team.data?.members.find((member) => member.role === "Team Lead");
  const deleteTeamMutation = useDeleteTeam({ id: teamId });

  const tabTriggerClass =
    "px-2 sm:px-3 md:px-4 h-12 sm:h-14 md:h-16 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-primary data-[state=active]:border-t-0 data-[state=active]:border-r-0 data-[state=active]:border-l-0 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent flex-shrink-0 min-w-[50px] sm:min-w-[60px] md:min-w-[120px] flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-1 snap-start";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full bg-secondary border text-black hover:bg-secondary/80 dark:text-white rounded-lg">
          Manage Team
        </Button>
      </DialogTrigger>
      <DialogContent
        style={{
          width: "50vw",
          maxWidth: "50vw",
        }}
      >
        <DialogHeader className="border-b pb-5">
          <DialogTitle>Manage Team</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview" className={tabTriggerClass}>
              <Settings className="mr-2 h-4 w-4" />
              Overview & Settings
            </TabsTrigger>
            <TabsTrigger value="members" className={tabTriggerClass}>
              <Users className="mr-2 h-4 w-4" /> Members
            </TabsTrigger>
            <TabsTrigger value="add" className={tabTriggerClass}>
              <Plus className="mr-2 h-4 w-4" /> Add Member
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <div className="p-4 flex flex-col gap-6">
              <div className="flex flex-row justify-between">
                <div className="flex flex-col gap-1">
                  <h1 className="text-lg font-medium">Team Details</h1>
                  <p className="text-sm text-muted-foreground">
                    View and manage your team details.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => deleteTeamMutation.mutateAsync({ id: teamId })}
                  disabled={deleteTeamMutation.isPending}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Team
                </Button>
              </div>

              <Separator />
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm text-muted-foreground">Team Name</p>
                  <p className="font-medium">{team.data?.name}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm text-muted-foreground">Team Lead</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={lead?.user.image || ""} />
                      <AvatarFallback>
                        {lead?.user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-medium">{lead?.user.name}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{team.data?.description}</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="members" className="mt-6">
            <div className="p-4">
              {/* Header */}
              <div className="flex flex-row w-full items-center justify-between mb-6">
                <div className="flex flex-col gap-1">
                  <h1 className="text-lg font-medium">Current Team Members</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your team members and their roles.
                  </p>
                </div>
              </div>

              {/* Members */}
              <div className="flex flex-col gap-4">
                {team.data?.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-row items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex flex-row items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={member.user.image || ""}
                          alt={member.user.name}
                        />
                        <AvatarFallback>
                          {member.user.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="font-medium text-sm">
                          {member.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit2 className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10"
                      >
                        <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="add" className="mt-6">
            <div className="p-4">
              <AddTeamMember teamId={teamId} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ManageTeam;
