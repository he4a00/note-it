"use client";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote, useEditorChange } from "@blocknote/react";
import type { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useNote, useUpdateNote } from "@/services/notes/hooks/useNotes";
import CreateNoteHeader from "./CreateNoteHeader";
import { Tag } from "@/lib/generated/prisma";
import { formatDistanceToNow } from "date-fns";
import { Cloud } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import SaveNoteButton from "./SaveNoteButton";

interface NotesEditorProps {
  onEditorReady?: (editor: BlockNoteEditor) => void;
  noteContent?: string;
  setNoteContent?: (content: string) => void;
  noteId?: string;
}

export default function NotesEditor({
  onEditorReady,
  noteContent,
  setNoteContent,
  noteId,
}: NotesEditorProps) {
  const editor = useCreateBlockNote();
  const [title, setTitle] = useState<string>("");
  const [tagsId, setTagsId] = useState<string[]>([]);
  const [folderId, setFolderId] = useState<string>("");
  const [organizationId, setOrganizationId] = useState<string>("");
  const [noteType, setNoteType] = useState<"NOTE" | "TEMPLATE">("NOTE");
  const [internalContent, setInternalContent] = useState<string>("");
  const { theme } = useTheme();
  const { data: noteData, isLoading: isLoadingNote } = useNote(noteId);
  const currentContent = noteContent ?? internalContent;

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  useEditorChange(async (editor) => {
    const blocksJson = JSON.stringify(editor.document);
    if (setNoteContent) {
      setNoteContent(blocksJson);
    } else {
      setInternalContent(blocksJson);
    }
  }, editor);

  useEffect(() => {
    async function loadInitialData() {
      if (editor && noteData) {
        if (noteData.content) {
          const blocks = JSON.parse(noteData.content);
          editor?.replaceBlocks(editor.document, blocks);
          // setLastSavedContent(noteData.content);
          if (!noteContent) {
            setInternalContent(noteData.content);
          }
        }
        if (noteData.tags) {
          setTagsId(noteData.tags.map((t: Tag) => t.id));
        }
        if (noteData.folderId) {
          setFolderId(noteData.folderId);
        }
        if (noteData.title) {
          setTitle(noteData.title);
        }
      }
    }
    loadInitialData();
  }, [editor, noteData, noteContent]);

  const handleTagsChange = (newTagsId: string[]) => {
    setTagsId(newTagsId);
  };

  const handleFolderChange = (newFolderId: string) => {
    setFolderId(newFolderId);
  };

  const handleOrgChange = (newOrgId: string) => {
    setOrganizationId(newOrgId);
  };

  const handleNoteTypeChange = (newNoteType: "NOTE" | "TEMPLATE") => {
    setNoteType(newNoteType);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const bnTheme = {
    light: {
      colors: {
        editor: {
          background: "transparent",
          text: "var(--foreground)",
        },
      },
      fontFamily: "var(--font-serif)",
    },
    dark: {
      colors: {
        editor: {
          background: "transparent",
          text: "var(--foreground)",
        },
      },
      fontFamily: "var(--font-serif)",
    },
  };

  if (noteId && isLoadingNote) {
    return (
      <div className="w-full h-full flex flex-col gap-4 container mx-auto px-8 py-6">
        <div className="flex flex-row justify-between items-center">
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
            <div className="h-8 w-32 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="h-4 w-40 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="flex justify-between items-center mb-2 mt-3">
          <div className="h-3 w-16 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="w-full flex-1 bg-muted/30 animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-row h-full flex-2 w-full bg-background min-h-screen">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col items-center relative">
        <div className="w-full flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-col gap-2 group">
            <div className="flex items-center justify-between h-6">
              {/* Breadcrumbs */}
              <Breadcrumb>
                <BreadcrumbList className="text-sm">
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  {noteData?.folder && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          href={`/dashboard?folder=${noteData.folder.id}`}
                        >
                          {noteData.folder.name}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </>
                  )}
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-muted-foreground">
                      {noteData?.title} (
                      {noteType === "TEMPLATE" ? "Template" : "Note"})
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              {/* Save Status Indicator */}
              <div className="flex flex-row items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground">
                  <Cloud className="h-3.5 w-3.5" />
                  <span>
                    {noteData?.updatedAt
                      ? `Edited ${formatDistanceToNow(
                          new Date(noteData.updatedAt),
                          {
                            addSuffix: true,
                          }
                        )}`
                      : "All changes saved"}
                  </span>
                </div>
                {noteId && (
                  <SaveNoteButton
                    noteId={noteId}
                    currentContent={currentContent}
                    title={title}
                    tagsId={tagsId}
                    folderId={folderId}
                    noteType={noteType}
                    orgId={organizationId}
                  />
                )}
              </div>
            </div>
            {noteId && (
              <CreateNoteHeader
                title={title}
                onTitleChange={handleTitleChange}
                tagsId={tagsId}
                setTagsId={handleTagsChange}
                folderId={folderId}
                setFolderId={handleFolderChange}
                noteType={noteType}
                setNoteType={handleNoteTypeChange}
                editor={editor}
                orgId={organizationId}
                setOrgId={handleOrgChange}
                noteId={noteId}
              />
            )}
          </div>

          {/* Editor Content */}
          <div className="flex-1 relative min-h-[500px]">
            <div className="font-serif">
              <BlockNoteView
                editor={editor}
                theme={theme === "dark" ? bnTheme.dark : bnTheme.light}
                // onBlur={handleBlur}
                className={cn(
                  "h-full min-h-full",
                  "font-serif text-lg leading-relaxed",
                  "[&_.bn-editor]:px-0",
                  "[&_.bn-block-content]:text-foreground/90"
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
