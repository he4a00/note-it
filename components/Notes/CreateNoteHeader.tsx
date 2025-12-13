"use client";

import { Suspense, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { FolderIcon, PlusIcon, XIcon } from "lucide-react";
import { useSuspenseTags, useCreateTag } from "@/services/tags/hooks/useTags";
import { Tag } from "@/lib/generated/prisma";
import TagColorPicker from "./TagColorPicker";
import {
  useCreateFolder,
  useSuspenseFolders,
} from "@/services/folders/hooks/useFolders";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import NoteMenu from "../shared/Menu/note-menu";
import { BlockNoteEditor } from "@blocknote/core";
import ChooseOrganization from "./ChooseOrganization";
import CreateComment from "./CreateComment";

interface CreateNoteHeaderProps {
  onTagsChange?: (tags: Tag[]) => void;
  onFolderChange?: (folder: string) => void;
  tagsId: string[];
  setTagsId: (tagsId: string[]) => void;
  folderId: string;
  setFolderId: (folderId: string) => void;
  noteType: "NOTE" | "TEMPLATE";
  setNoteType: (noteType: "NOTE" | "TEMPLATE") => void;
  title?: string;
  orgId?: string;
  setOrgId: (orgId: string) => void;
  onTitleChange?: (title: string) => void;
  editor?: BlockNoteEditor | null;
  noteId?: string;
}

const CreateNoteHeader = ({
  onTagsChange,
  onFolderChange,
  tagsId,
  setTagsId,
  folderId,
  setFolderId,
  noteType,
  setNoteType,
  title = "",
  orgId,
  setOrgId,
  onTitleChange,
  editor,
  noteId,
}: CreateNoteHeaderProps) => {
  //  Tags Stats
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  //  Folder Stats
  const [folderPopoverOpen, setFolderPopoverOpen] = useState(false);
  const [folder, setFolder] = useState<string>("");
  const [newFolder, setNewFolder] = useState("");

  //  Organization State
  const [organizationPopoverOpen, setOrganizationPopoverOpen] = useState(false);

  // Tags
  const { data: tagsData } = useSuspenseTags();
  const createTagMutation = useCreateTag();

  // Folders

  const { data: foldersData } = useSuspenseFolders();
  const createFolderMutation = useCreateFolder();

  // Tags Functions

  useEffect(() => {
    if (tagsData) {
      const tags = tagsData.filter((tag) => tagsId.includes(tag.id));
      setSelectedTags(tags);
    }
  }, [tagsId, tagsData]);

  const handleAddExistingTag = (tag: Tag) => {
    if (!selectedTags.find((t) => t.id === tag.id)) {
      const updatedTags = [...selectedTags, tag];
      setSelectedTags(updatedTags);
      setTagsId([...tagsId, tag.id]);
      onTagsChange?.(updatedTags);
      setTagPopoverOpen(false);
    }
  };

  const handleCreateAndAddTag = async () => {
    if (newTagName.trim()) {
      try {
        const newTag = await createTagMutation.mutateAsync({
          name: newTagName.trim(),
          color: newTagColor,
        });
        const updatedTags = [...selectedTags, newTag];
        setSelectedTags(updatedTags);
        setTagsId([...tagsId, newTag.id]);
        onTagsChange?.(updatedTags);
        setNewTagName("");
        setNewTagColor("#3b82f6");
        setTagPopoverOpen(false);
      } catch (error) {
        console.error("Failed to create tag:", error);
      }
    }
  };

  const handleRemoveTag = (tagId: string) => {
    const updatedTags = selectedTags.filter((tag) => tag.id !== tagId);
    setSelectedTags(updatedTags);
    setTagsId(tagsId.filter((id) => id !== tagId));
    onTagsChange?.(updatedTags);
  };

  // Folders Functions

  const handleSelectFolder = (selectedFolder: { id: string; name: string }) => {
    setFolder(selectedFolder.name);
    setFolderId(selectedFolder.id);
    onFolderChange?.(selectedFolder.name);
    setFolderPopoverOpen(false);
  };

  const handleCreateFolder = async () => {
    if (newFolder) {
      try {
        const createdFolder = await createFolderMutation.mutateAsync({
          name: newFolder,
        });
        setFolder(createdFolder.name);
        setFolderId(createdFolder.id);
        onFolderChange?.(createdFolder.name);
        setNewFolder("");
        setFolderPopoverOpen(false);
      } catch (error) {
        console.error("Failed to create folder:", error);
      }
    }
  };

  // Organizations Functions

  const handleSelectOrg = ({ id }: { id: string; name: string }) => {
    setOrgId(id);
    setOrganizationPopoverOpen(false);
  };

  useEffect(() => {
    if (foldersData && folderId) {
      const selectedFolder = foldersData.find((f) => f.id === folderId);
      if (selectedFolder) {
        setFolder(selectedFolder.name);
      }
    } else if (!folderId) {
      setFolder("");
    }
  }, [folderId, foldersData]);

  const availableTags =
    tagsData?.filter(
      (tag: Tag) => !selectedTags.find((t) => t.id === tag.id)
    ) || [];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Title Section */}
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder="Untitled"
          className="w-full bg-transparent border-none outline-none text-5xl font-bold text-foreground placeholder:text-muted-foreground/30 focus:placeholder:text-muted-foreground/50 transition-colors font-serif leading-tight py-2"
        />
      </div>

      {/* Metadata Section */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 ">
        {/* Tags and Folder Section */}
        <div className="flex items-center gap-4">
          {/* Tags Section */}
          <div className="flex flex-row items-center gap-2 flex-1">
            {/* Selected Tags */}
            {selectedTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80 text-[13px]"
                style={{
                  backgroundColor: tag.color + "20",
                  borderColor: tag.color,
                }}
              >
                <div
                  className="size-3 rounded-full "
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-[13px]">{tag.name}</span>
                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  className="rounded-sm hover:bg-destructive/20 p-0.5"
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            ))}

            {/* Add Tag Popover */}
            <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 gap-1 text-xs"
                >
                  <PlusIcon className="size-3" />
                  Add Tag
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[350px] p-0"
                align="start"
                onInteractOutside={(e) => {
                  e.preventDefault();
                }}
              >
                <Command>
                  <CommandInput placeholder="Search tags..." />
                  <CommandList>
                    {availableTags.length > 0 && (
                      <Suspense fallback={<div>Loading...</div>}>
                        <CommandGroup heading="Existing Tags">
                          {availableTags.map((tag: Tag) => (
                            <CommandItem
                              key={tag.id}
                              onSelect={() => handleAddExistingTag(tag)}
                              className="flex items-center gap-2"
                            >
                              <div
                                className="size-3 rounded-full"
                                style={{ backgroundColor: tag.color }}
                              />
                              <span className="text-sm font-medium">
                                {tag.name}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Suspense>
                    )}

                    {availableTags.length > 0 && <CommandSeparator />}

                    <div className="p-3">
                      <p className="text-xs font-medium mb-3 text-muted-foreground">
                        Create New Tag
                      </p>
                      <div className="flex flex-col gap-3">
                        <Input
                          placeholder="Tag name"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleCreateAndAddTag();
                            }
                          }}
                          className="h-9"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            Color:
                          </span>
                          <TagColorPicker
                            color={newTagColor}
                            onChange={setNewTagColor}
                          />
                          <Button
                            size="sm"
                            onClick={handleCreateAndAddTag}
                            disabled={
                              !newTagName.trim() || createTagMutation.isPending
                            }
                            className="ml-auto"
                          >
                            {createTagMutation.isPending
                              ? "Creating..."
                              : "Create"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Folder Section */}
          <div className="flex flex-row items-center gap-2">
            {folder ? (
              <Badge
                variant="outline"
                className="gap-1 pr-1 cursor-pointer hover:bg-accent text-[13px]"
              >
                <FolderIcon className="size-3" />
                {folder}
                <button
                  onClick={() => {
                    setFolder("");
                    onFolderChange?.("");
                    setFolderId("");
                  }}
                  className="rounded-sm hover:bg-destructive/20 p-0.5"
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            ) : (
              <Popover
                open={folderPopoverOpen}
                onOpenChange={setFolderPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 gap-1 text-xs"
                  >
                    <FolderIcon className="size-3" />
                    Select Folder
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[300px] p-0"
                  align="start"
                  onInteractOutside={(e) => {
                    e.preventDefault();
                  }}
                >
                  <Command>
                    <CommandInput placeholder="Search folders..." />
                    <CommandList>
                      {foldersData && foldersData.length > 0 ? (
                        <CommandGroup heading="Existing Folders">
                          {foldersData.map((folderItem) => (
                            <CommandItem
                              key={folderItem.id}
                              onSelect={() => handleSelectFolder(folderItem)}
                              style={{
                                backgroundColor: "transparent",
                              }}
                              className="flex items-center gap-2 mt-2 cursor-pointer hover:bg-[#eee]"
                            >
                              <FolderIcon className="size-4" />
                              <span className="text-sm font-medium">
                                {folderItem.name}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ) : (
                        <CommandEmpty>
                          <p className="text-sm text-muted-foreground">
                            No folders found.
                          </p>
                        </CommandEmpty>
                      )}

                      {foldersData && foldersData.length > 0 && (
                        <CommandSeparator />
                      )}

                      <div className="p-3">
                        <p className="text-xs font-medium mb-3 text-muted-foreground">
                          Create New Folder
                        </p>
                        <div className="flex flex-col gap-3">
                          <Input
                            placeholder="Folder name"
                            value={newFolder}
                            onChange={(e) => setNewFolder(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleCreateFolder();
                              }
                            }}
                            className="h-9"
                          />
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              onClick={handleCreateFolder}
                              disabled={
                                !newFolder.trim() ||
                                createFolderMutation.isPending
                              }
                            >
                              {createFolderMutation.isPending
                                ? "Creating..."
                                : "Create"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Organizations Section */}
          <ChooseOrganization
            selectedOrgId={orgId || null}
            onClearOrg={() => setOrgId("")}
            organizationPopoverOpen={organizationPopoverOpen}
            setOrganizationPopoverOpen={setOrganizationPopoverOpen}
            onSelectOrg={handleSelectOrg}
          />

          {/* Type Section */}
          <div className="flex items-center gap-4">
            <RadioGroup
              value={noteType}
              onValueChange={(value) =>
                setNoteType(value as "NOTE" | "TEMPLATE")
              }
              className="flex flex-row gap-2"
            >
              <RadioGroupItem
                className="border-2 border-gray-400"
                value="NOTE"
              />
              <Label htmlFor="NOTE">Note</Label>
              <RadioGroupItem
                className="border-2 border-gray-400"
                value="TEMPLATE"
              />
              <Label htmlFor="TEMPLATE">Template</Label>
            </RadioGroup>
          </div>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <NoteMenu editor={editor} noteTitle={title} />
        </div>
      </div>
    </div>
  );
};

export default CreateNoteHeader;
