import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Briefcase,
  FileText,
  LayoutTemplate,
  Sparkles,
  UserPlus,
  Trash,
  Edit,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity, User } from "@/lib/generated/prisma";

interface RecentActivitiesProps {
  activities: (Activity & { user: User })[];
}

const getActionIcon = (action: string) => {
  switch (action) {
    case "ORG_CREATED":
      return <Briefcase className="h-4 w-4 text-blue-500" />;
    case "MEMBER_ADDED":
      return <UserPlus className="h-4 w-4 text-green-500" />;
    case "NOTE_CREATED":
      return <FileText className="h-4 w-4 text-orange-500" />;
    case "TEMPLATE_UPDATED":
      return <LayoutTemplate className="h-4 w-4 text-purple-500" />;
    case "ORG_DELETED":
      return <Trash className="h-4 w-4 text-red-500" />;
    default:
      return <Sparkles className="h-4 w-4 text-gray-500" />;
  }
};

const getActionDescription = (activity: Activity & { user: User }) => {
  const userName = activity.user.name || "Unknown user";

  if (typeof activity.metadata === "string") {
    const metadataStr = activity.metadata as string;
    const parts = metadataStr.split(userName);

    if (parts.length > 1) {
      return (
        <span>
          <span className="font-semibold text-foreground">{userName}</span>
          {parts[1]}
        </span>
      );
    }

    return <span>{metadataStr}</span>;
  }

  // Fallback for non-string metadata
  switch (activity.action) {
    case "ORG_CREATED":
      return (
        <span>
          <span className="font-semibold text-foreground">{userName}</span>{" "}
          created organization
        </span>
      );
    case "MEMBER_ADDED":
      return (
        <span>
          <span className="font-semibold text-foreground">{userName}</span>{" "}
          joined the organization
        </span>
      );
    case "NOTE_CREATED":
      return (
        <span>
          <span className="font-semibold text-foreground">{userName}</span>{" "}
          created a note
        </span>
      );
    default:
      return (
        <span>
          <span className="font-semibold text-foreground">{userName}</span>{" "}
          performed {activity.action}
        </span>
      );
  }
};

const RecentActivities = ({ activities }: RecentActivitiesProps) => {
  return (
    <div className="flex flex-col gap-4 container mx-auto mt-24">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Sparkles className="h-4 w-4 text-orange-500" />
        Recent Activity
      </div>
      <div className="flex flex-col rounded-xl border bg-card shadow-sm">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No recent activity
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={activity.id}
              className={`flex items-center gap-4 p-4 ${
                index !== activities.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/50">
                {getActionIcon(activity.action)}
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <p className="text-sm text-muted-foreground">
                  {getActionDescription(activity)}
                </p>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivities;
