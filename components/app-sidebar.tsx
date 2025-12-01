"use client";

import { Home, Settings, Star, Trash2, Folder } from "lucide-react";

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
  // {
  //   title: "Archived",
  //   url: "/dashboard/archived",
  //   icon: Trash2,
  // },
  // {
  //   title: "Settings",
  //   url: "/dashboard/settings",
  //   icon: Settings,
  // },
];

export function AppSidebar() {
  const tags = useSuspenseTags();
  const folders = useSuspenseFolders();
  const { data: session } = authClient.useSession();
  const { data: loggedUser } = useGetUser(session?.user?.id || "");
  const myOrgs = useGetMyOrgs();

  return (
    <Sidebar>
      <SidebarContent className="mt-10">
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} prefetch>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Organizations */}
        <SidebarGroup>
          <SidebarGroupLabel>My Organizations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {myOrgs.isLoading ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuButton disabled>
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-24" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              ) : (
                myOrgs.data?.map((org) => (
                  <SidebarMenuItem key={org.id} className="ml-2">
                    <SidebarMenuButton asChild>
                      <div className="flex flex-row items-center gap-2">
                        <Image
                          src={org.image || ""}
                          alt={org.name}
                          width={30}
                          height={30}
                          className="rounded-full"
                        />
                        <Link href={`/dashboard/organization/${org.id}`}>
                          <span className="text-sm">
                            {org.name.slice(0, 1).toUpperCase() +
                              org.name.slice(1)}{" "}
                          </span>
                        </Link>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Folders */}
        <SidebarGroup>
          <SidebarGroupLabel>Folders</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {folders.isLoading ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuButton disabled>
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-24" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              ) : (
                folders.data?.map((folder) => (
                  <SidebarMenuItem key={folder.id}>
                    <SidebarMenuButton asChild>
                      <a href={`/dashboard/folders/${folder.id}`}>
                        <Folder />
                        <span>
                          {folder.name.slice(0, 1).toUpperCase() +
                            folder.name.slice(1)}{" "}
                          <span className="text-xs">
                            ({folder.notes.length})
                          </span>
                        </span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Tags */}
        <SidebarGroup>
          <SidebarGroupLabel>Tags</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tags.isLoading ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuButton disabled>
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              ) : (
                tags.data?.map((tag) => (
                  <SidebarMenuItem key={tag.id}>
                    <SidebarMenuButton asChild>
                      <a href={`/dashboard/tags/${tag.id}`}>
                        <p className="flex items-center gap-2">
                          <span
                            style={{ backgroundColor: tag.color }}
                            className={cn(`w-3 h-3 rounded-full`)}
                          ></span>{" "}
                          {tag.name.slice(0, 1).toUpperCase() +
                            tag.name.slice(1)}{" "}
                          <span className="text-xs">({tag.notes.length})</span>
                        </p>
                      </a>
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
