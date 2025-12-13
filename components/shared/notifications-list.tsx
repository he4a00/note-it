import { Bell, Check, CheckCheck, Inbox } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  useGetAllNotifications,
  useMarkAllAsRead,
  useMarkAsRead,
} from "@/services/notifications/hooks/useNotifications";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

const NotificationsList = () => {
  const notifications = useGetAllNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const unreadCount =
    notifications.data?.items.filter((n) => !n.isRead).length ?? 0;

  // Subscribe to Pusher for real-time notifications
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = pusherClient.subscribe(`user-${session.user.id}`);

    channel.bind("new-notification", () => {
      // Invalidate the notifications query to refetch
      queryClient.invalidateQueries(trpc.notifications.getAll.queryOptions({}));
      queryClient.invalidateQueries(
        trpc.notifications.getUnreadCount.queryOptions()
      );
    });

    return () => {
      channel.unbind("new-notification");
      pusherClient.unsubscribe(`user-${session.user.id}`);
    };
  }, [session?.user?.id, queryClient, trpc]);

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead.mutate({ id });
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead.mutate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative group hover:bg-accent/80 transition-colors duration-200"
        >
          <Bell
            size={20}
            className="transition-transform duration-200 group-hover:scale-110"
          />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
              <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[380px] p-0 shadow-xl border-border/50 rounded-xl overflow-hidden"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary/15 text-primary text-xs font-medium">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {notifications.data?.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground px-4">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                  <Inbox className="h-8 w-8 text-muted-foreground/50" />
                </div>
              </div>
              <p className="text-sm font-medium text-foreground/80">
                All caught up!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                No new notifications
              </p>
            </div>
          ) : (
            <div className="flex flex-col py-1">
              {notifications.data?.items.map((notification, index) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 cursor-pointer rounded-none transition-all duration-200",
                    "hover:bg-accent/50 focus:bg-accent/50",
                    !notification.isRead && "bg-primary/5 hover:bg-primary/10",
                    index !== (notifications.data?.items.length ?? 0) - 1 &&
                      "border-b border-border/30"
                  )}
                  onClick={(e) => {
                    if (!notification.isRead) {
                      handleMarkAsRead(notification.id, e);
                    }
                  }}
                >
                  {/* Unread indicator */}
                  <div className="flex items-center justify-center w-2 pt-2">
                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                    <AvatarImage src={notification.user?.image || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
                      {notification.user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        !notification.isRead
                          ? "font-medium text-foreground"
                          : "text-foreground/80"
                      )}
                    >
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/40" />
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  {/* Mark as read button */}
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id, e);
                      }}
                      disabled={markAsRead.isPending}
                    >
                      <Check className="h-4 w-4" />
                      <span className="sr-only">Mark as read</span>
                    </Button>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.data?.items && notifications.data.items.length > 0 && (
          <div className="border-t border-border/50 p-2 bg-muted/30">
            <Button
              variant="ghost"
              className="w-full h-8 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsList;
