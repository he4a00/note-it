"use client";

import {
  Search,
  SlidersHorizontal,
  Star,
  Tag,
  Folder,
  Pin,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toggle } from "@/components/ui/toggle";
import { useSuspenseTags } from "@/services/tags/hooks/useTags";
import { useSuspenseFolders } from "@/services/folders/hooks/useFolders";
import { cn } from "@/lib/utils";

interface NotesFiltersProps {
  tagId: string;
  setTagId: (tagId: string) => void;
  folderId: string;
  setFolderId: (folderId: string) => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  isPinned: boolean;
  setIsPinned: (isPinned: boolean) => void;
}

const NotesFilter = ({
  tagId,
  setTagId,
  folderId,
  setFolderId,
  searchQuery,
  setSearchQuery,
  isPinned,
  setIsPinned,
}: NotesFiltersProps) => {
  const tags = useSuspenseTags();
  const folders = useSuspenseFolders();

  const selectedTag = tags.data?.find((tag) => tag.id === tagId);

  return (
    <div className="container mx-auto flex flex-1 items-center justify-between gap-4">
      <div className="relative flex-1 max-w-xl">
        <div className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md bg-primary/10 p-1">
          <Search className="h-3 w-3 text-primary" />
        </div>
        <Input
          type="search"
          placeholder="Search notes..."
          className="h-9 w-full border-transparent bg-muted/50 pl-10 placeholder:text-muted-foreground focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 lg:w-[400px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Toggle
          aria-label="Toggle pinned"
          size="sm"
          className="h-8 cursor-pointer gap-2 px-2 data-[state=on]:bg-amber-100 data-[state=on]:text-amber-700 dark:data-[state=on]:bg-amber-900/30 dark:data-[state=on]:text-amber-400 lg:px-3"
          pressed={isPinned}
          onPressedChange={setIsPinned}
        >
          <Pin className="h-4 w-4" />
        </Toggle>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 px-2 text-muted-foreground hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400 lg:px-3"
            >
              <Tag className="h-4 w-4" />
              <span className="hidden lg:inline">
                {!selectedTag
                  ? "Tags"
                  : selectedTag.name.slice(0, 1).toUpperCase() +
                    selectedTag.name.slice(1)}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-[200px]">
            <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem onCheckedChange={() => setTagId("")}>
              All
            </DropdownMenuCheckboxItem>
            {tags.data?.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag.id}
                onCheckedChange={() => setTagId(tag.id)}
              >
                <span
                  style={{ backgroundColor: tag.color }}
                  className={cn(`w-3 h-3 rounded-full`)}
                ></span>{" "}
                <span>
                  {tag.name.slice(0, 1).toUpperCase() + tag.name.slice(1)}
                </span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 px-2 text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 lg:px-3"
            >
              <Folder className="h-4 w-4" />
              <span className="hidden lg:inline">Folder</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-[200px]">
            <DropdownMenuLabel>Filter by Folder</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem onCheckedChange={() => setFolderId("")}>
              All
            </DropdownMenuCheckboxItem>
            {folders.data?.map((folder) => (
              <DropdownMenuCheckboxItem
                key={folder.id}
                onCheckedChange={() => setFolderId(folder.id)}
              >
                <Folder />
                <span>
                  {folder.name.slice(0, 1).toUpperCase() + folder.name.slice(1)}
                </span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default NotesFilter;
