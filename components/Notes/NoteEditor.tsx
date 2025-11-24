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
  const [tagsId, setTagsId] = useState<string[]>([]);
  const [folderId, setFolderId] = useState<string>("");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { theme } = useTheme();
  const { data: noteData } = useNote(noteId);
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
      currentFolderId: string
    ) => {
      if (
        !noteId ||
        (content === lastSavedContent &&
          JSON.stringify(currentTagsId) ===
            JSON.stringify(noteData?.tags?.map((t: Tag) => t.id) || []) &&
          currentFolderId === noteData?.folderId) ||
        !content.trim() ||
        content === "[]"
      )
        return;

      setSaveStatus("saving");
      updateNoteMutation.mutate(
        {
          id: noteId,
          content,
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
        saveNotes(currentContent, tagsId, folderId);
      }, 2500);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [currentContent, saveNotes, lastSavedContent, tagsId, folderId]);

  const handleBlur = useCallback(() => {
    if (currentContent && currentContent !== lastSavedContent) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveNotes(currentContent, tagsId, folderId);
    }
  }, [currentContent, lastSavedContent, saveNotes, tagsId, folderId]);

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

  const bnTheme = {
    light: { colors: { editor: { background: "#f4f8fb" } } },
    dark: { colors: { editor: { background: "#1c2433" } } },
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case "saving":
        return "Saving...";
      case "saved":
        return "Saved";
      case "error":
        return "Error saving";
      default:
        return "";
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case "saving":
        return "text-blue-500";
      case "saved":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-transparent";
    }
  };

  return (
    <div className="w-full h-full max-h-[calc(100vh-5rem)] mt-5">
      <div className="flex flex-row justify-between items-center">
        {noteId && (
          <>
            <CreateNoteHeader
              tagsId={tagsId}
              setTagsId={handleTagsChange}
              folderId={folderId}
              setFolderId={handleFolderChange}
            />
            <p className="text-muted-foreground">
              Last Edited:{" "}
              {noteData?.updatedAt &&
                formatDistanceToNow(new Date(noteData.updatedAt), {
                  addSuffix: true,
                })}
            </p>
          </>
        )}
      </div>
      <div className="flex justify-between items-center mb-2 mt-3">
        <div
          className={`text-xs transition-opacity duration-300 ${getSaveStatusColor()}`}
        >
          {getSaveStatusText()}
        </div>
      </div>
      <BlockNoteView
        editor={editor}
        theme={theme === "dark" ? bnTheme.dark : bnTheme.light}
        onBlur={handleBlur}
      />
    </div>
  );
}
