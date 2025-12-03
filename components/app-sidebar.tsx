"use client";

import {
  Home,
  Settings,
  Star,
  Trash2,
  Folder,
  Building2,
  Hash,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSuspenseTags } from "../services/tags/hooks/useTags";
import { cn } from "@/lib/utils";
import { useSuspenseFolders } from "@/services/folders/hooks/useFolders";
import { NavUser } from "./nav-user";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import { useGetUser } from "@/services/user/hooks/useUser";
import { useGetMyOrgs } from "@/services/organizations/hooks/useOrganization";
import Image from "next/image";

const items = [
  {
    title: "All Notes",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Templates",
    url: "/dashboard/templates",
    icon: Star,
  },
];

export function AppSidebar() {
  const tags = useSuspenseTags();
  const folders = useSuspenseFolders();
  const { data: session } = authClient.useSession();
  const { data: loggedUser } = useGetUser(session?.user?.id || "");
  const myOrgs = useGetMyOrgs();

  return (
    <Sidebar>
      <SidebarContent className="mt-10 gap-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 px-2 mb-2">
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-sidebar-accent/50 transition-all duration-200"
                  >
                    <Link href={item.url} prefetch className="gap-3">
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Organizations */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 px-2 mb-2 flex items-center gap-2">
            <Building2 className="h-3 w-3" />
            Organizations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {myOrgs.isLoading ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuButton disabled>
                        <Skeleton className="h-6 w-6 rounded-md" />
                        <Skeleton className="h-4 w-28 flex-1" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              ) : (
                myOrgs.data?.map((org) => (
                  <SidebarMenuItem key={org.id}>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-sidebar-accent/50 transition-all duration-200"
                    >
                      <Link
                        href={`/dashboard/organization/${org.id}`}
                        prefetch
                        className="flex items-center gap-3 w-full group"
                      >
                        <div className="relative">
                          <Image
                            src={org.image || ""}
                            alt={org.name}
                            width={24}
                            height={24}
                            className="rounded-md ring-1 ring-sidebar-border group-hover:ring-sidebar-accent transition-all duration-200"
                          />
                        </div>
                        <span className="font-medium text-sm truncate">
                          {org.name.slice(0, 1).toUpperCase() +
                            org.name.slice(1)}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Folders */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 px-2 mb-2">
            Folders
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {folders.isLoading ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuButton disabled>
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-28 flex-1" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              ) : (
                folders.data?.map((folder) => (
                  <SidebarMenuItem key={folder.id}>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-sidebar-accent/50 transition-all duration-200 group"
                    >
                      <Link
                        href={`/dashboard/folders/${folder.id}`}
                        className="gap-3"
                      >
                        <Folder className="h-4 w-4 text-sidebar-foreground/70 group-hover:text-sidebar-foreground transition-colors" />
                        <span className="flex-1 flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {folder.name.slice(0, 1).toUpperCase() +
                              folder.name.slice(1)}
                          </span>
                          <span className="text-xs text-sidebar-foreground/50 bg-sidebar-accent/30 px-2 py-0.5 rounded-full font-medium">
                            {folder.notes.length}
                          </span>
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Tags */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 px-2 mb-2 flex items-center gap-2">
            <Hash className="h-3 w-3" />
            Tags
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tags.isLoading ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuButton disabled>
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-4 w-24 flex-1" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              ) : (
                tags.data?.map((tag) => (
                  <SidebarMenuItem key={tag.id}>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-sidebar-accent/50 transition-all duration-200 group"
                    >
                      <Link
                        href={`/dashboard/tags/${tag.id}`}
                        className="gap-3"
                      >
                        <div className="relative flex items-center gap-3 flex-1">
                          <span
                            style={{ backgroundColor: tag.color }}
                            className={cn(
                              "w-3 h-3 rounded-full ring-2 ring-sidebar/50 group-hover:ring-sidebar-accent/50 transition-all duration-200 shadow-sm"
                            )}
                          />
                          <span className="flex-1 flex items-center justify-between">
                            <span className="font-medium text-sm">
                              {tag.name.slice(0, 1).toUpperCase() +
                                tag.name.slice(1)}
                            </span>
                            <span className="text-xs text-sidebar-foreground/50 bg-sidebar-accent/30 px-2 py-0.5 rounded-full font-medium">
                              {tag.notes.length}
                            </span>
                          </span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={
            loggedUser?.name
              ? {
                  name: loggedUser.name,
                  email: loggedUser.email,
                  image: loggedUser.image ?? "",
                  id: loggedUser.id,
                }
              : { name: "", email: "", image: "", id: "" }
          }
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
