"use client";

import { cn } from "@/lib/utils";
import { FileText, StickyNote } from "lucide-react";
import NoteCard from "../Notes/NoteCard";
import { Button } from "../ui/button";

export interface OrganizationNotesProps {
  notes: Array<{
    id: string;
    type: "NOTE" | "TEMPLATE";
    title: string;
    content: string;
    isPinned: boolean;
    isFavorite: boolean;
    updatedAt: Date | string;
    tags: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  }>;
  maxDisplay?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const OrganizationNotes = ({
  notes,
  maxDisplay = 4,
  showViewAll = true,
  onViewAll,
}: OrganizationNotesProps) => {
  const displayedNotes = notes.slice(0, maxDisplay);

  return (
    <div className="flex flex-col gap-4 mt-20">
      <div className="flex flex-row items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg sm:text-xl font-semibold">
            Organization Notes
          </h2>
        </div>
        {showViewAll && notes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="hover:underline hover:bg-transparent dark:hover:bg-transparent text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View All ({notes.length})
          </Button>
        )}
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-3">
            <FileText className="w-6 h-6 text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            No notes in this organization
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Notes shared with this organization will appear here
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4 w-full",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          )}
        >
          {displayedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              viewMode="grid"
              selectedIds={[]}
              setSelectedIds={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizationNotes;
