"use client";

import { cn } from "@/lib/utils";
import {
  useDeleteNote,
  useTogglePinNote,
} from "@/services/notes/hooks/useNotes";
import { Edit2, Pin, Trash2 } from "lucide-react";
import Link from "next/link";

const NoteToolbox = ({ noteId }: { noteId: string }) => {
  const deleteNoteMutation = useDeleteNote();
  const togglePinMutation = useTogglePinNote();
  return (
    <div
      className={cn(
        "absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-zinc-200 shadow-sm dark:bg-background dark:border-zinc-800"
      )}
    >
      <button
        onClick={() => togglePinMutation.mutate({ id: noteId })}
        disabled={togglePinMutation.isPending}
        className="p-1.5 cursor-pointer rounded-md text-zinc-500 hover:text-green-600 hover:bg-green-50 transition-colors dark:hover:bg-green-500 dark:hover:text-green-50"
      >
        <Pin className="h-4 w-4" />
      </button>
      <Link href={`/dashboard/${noteId}`} prefetch>
        <button className="p-1.5 cursor-pointer rounded-md text-zinc-500 hover:text-blue-600 hover:bg-blue-50 transition-colors dark:hover:bg-blue-500 dark:hover:text-blue-50">
          <Edit2 className="h-4 w-4" />
        </button>
      </Link>
      <button
        onClick={() => deleteNoteMutation.mutate({ id: noteId })}
        disabled={deleteNoteMutation.isPending}
        className="p-1.5 cursor-pointer rounded-md text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors dark:hover:bg-red-500 dark:hover:text-red-50"
      >
        <Trash2 className={cn("h-4 w-4")} />
      </button>
    </div>
  );
};

export default NoteToolbox;
