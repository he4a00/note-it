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
        "absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex items-center gap-1 bg-white/80 backdrop-blur-md p-1 rounded-full border border-black/5 shadow-sm dark:bg-zinc-900/80 dark:border-white/10"
      )}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          togglePinMutation.mutate({ id: noteId });
        }}
        disabled={togglePinMutation.isPending}
        className="p-1.5 cursor-pointer rounded-full text-zinc-400 hover:text-orange-500 hover:bg-orange-50 transition-colors dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
        title="Pin Note"
      >
        <Pin className="h-3.5 w-3.5" />
      </button>
      <Link
        href={`/dashboard/${noteId}`}
        prefetch
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="p-1.5 cursor-pointer rounded-full text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-colors dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
          title="Edit Note"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      </Link>
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteNoteMutation.mutate({ id: noteId });
        }}
        disabled={deleteNoteMutation.isPending}
        className="p-1.5 cursor-pointer rounded-full text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors dark:hover:bg-red-500/10 dark:hover:text-red-400"
        title="Delete Note"
      >
        <Trash2 className={cn("h-3.5 w-3.5")} />
      </button>
    </div>
  );
};

export default NoteToolbox;
