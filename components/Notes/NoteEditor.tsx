"use client";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote, useEditorChange } from "@blocknote/react";
import type { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useEffect, useState, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { useNote, useUpdateNote } from "@/services/notes/hooks/useNotes";
import CreateNoteHeader from "./CreateNoteHeader";
import { Tag } from "@/lib/generated/prisma";
import { formatDistanceToNow } from "date-fns";
import { Check, Cloud, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface NotesEditorProps {
  onEditorReady?: (editor: BlockNoteEditor) => void;
  noteContent?: string;
  setNoteContent?: (content: string) => void;
  noteId?: string;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function NotesEditor({
  onEditorReady,
  noteContent,
  setNoteContent,
  noteId,
}: NotesEditorProps) {
  const editor = useCreateBlockNote();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [internalContent, setInternalContent] = useState<string>("");
  const [lastSavedContent, setLastSavedContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [tagsId, setTagsId] = useState<string[]>([]);
  const [folderId, setFolderId] = useState<string>("");
  const [noteType, setNoteType] = useState<"NOTE" | "TEMPLATE">("NOTE");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { theme } = useTheme();
  const { data: noteData, isLoading: isLoadingNote } = useNote(noteId);
  const updateNoteMutation = useUpdateNote();
  const currentContent = noteContent ?? internalContent;

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  const saveNotes = useCallback(
    async (
      content: string,
      currentTagsId: string[],
      currentFolderId: string,
      currentTitle: string
    ) => {
      if (
        !noteId ||
        (content === lastSavedContent &&
          JSON.stringify(currentTagsId) ===
            JSON.stringify(noteData?.tags?.map((t: Tag) => t.id) || []) &&
          currentFolderId === noteData?.folderId &&
          currentTitle === noteData?.title) ||
        !content.trim() ||
        content === "[]"
      )
        return;

      setSaveStatus("saving");
      updateNoteMutation.mutate(
        {
          id: noteId,
          content,
          title: currentTitle || "Untitled",
          tagIds: currentTagsId,
          folderId: currentFolderId || null,
        },
        {
          onSuccess: () => {
            setLastSavedContent(content);
            setSaveStatus("saved");

            setTimeout(() => {
              setSaveStatus("idle");
            }, 2000);
          },
          onError: (error) => {
            console.error("Failed to save notes:", error);
            setSaveStatus("error");
          },
        }
      );
    },
    [lastSavedContent, updateNoteMutation, noteId, noteData]
  );

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
          editor.replaceBlocks(editor.document, blocks);
          setLastSavedContent(noteData.content);
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

  useEffect(() => {
    if (currentContent && currentContent !== lastSavedContent) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveNotes(currentContent, tagsId, folderId, title);
      }, 2500);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [currentContent, saveNotes, lastSavedContent, tagsId, folderId, title]);

  const handleBlur = useCallback(() => {
    if (currentContent && currentContent !== lastSavedContent) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveNotes(currentContent, tagsId, folderId, title);
    }
  }, [currentContent, lastSavedContent, saveNotes, tagsId, folderId, title]);

  const handleTagsChange = (newTagsId: string[]) => {
    setTagsId(newTagsId);
    // Immediate save for tags
    updateNoteMutation.mutate({
      id: noteId!,
      tagIds: newTagsId,
      folderId: folderId || null,
      content: currentContent,
    });
  };

  const handleFolderChange = (newFolderId: string) => {
    setFolderId(newFolderId);
    // Immediate save for folder
    updateNoteMutation.mutate({
      id: noteId!,
      folderId: newFolderId || null,
      tagIds: tagsId,
      content: currentContent,
    });
  };

  const handleNoteTypeChange = (newNoteType: "NOTE" | "TEMPLATE") => {
    setNoteType(newNoteType);
    // Immediate save for note type
    updateNoteMutation.mutate({
      id: noteId!,
      type: newNoteType,
      tagIds: tagsId,
      folderId: folderId || null,
      content: currentContent,
    });
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
    <div className="flex flex-row h-full w-full bg-background min-h-screen">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col items-center relative">
        <div
          className={cn("w-full max-w-5xl flex flex-col gap-8", noteId && "")}
        >
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
              {noteId && (
                <div className="flex items-center justify-end min-w-[100px] duration-500">
                  {updateNoteMutation.isPending || saveStatus === "saving" ? (
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground duration-300">
                      <Loader2 className="animate-spin h-3.5 w-3.5" />
                      <span>Saving...</span>
                    </div>
                  ) : saveStatus === "saved" ? (
                    <div className="flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-500 duration-300">
                      <Check className="h-3.5 w-3.5" />
                      <span>Saved</span>
                    </div>
                  ) : saveStatus === "error" ? (
                    <div className="flex items-center gap-2 text-xs font-medium text-destructive duration-300">
                      <span>Error saving</span>
                    </div>
                  ) : (
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
                  )}
                </div>
              )}
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
              />
            )}
          </div>

          {/* Editor Content */}
          <div className="flex-1 relative min-h-[500px]">
            <div className="font-serif">
              <BlockNoteView
                editor={editor}
                theme={theme === "dark" ? bnTheme.dark : bnTheme.light}
                onBlur={handleBlur}
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
