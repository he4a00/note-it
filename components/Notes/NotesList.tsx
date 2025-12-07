"use client";

import { useSuspenseNotes } from "@/services/notes/hooks/useNotes";
import { cn } from "@/lib/utils";
import { Suspense, useState, useTransition } from "react";
import { EmptyComponent } from "../shared/entity-components";
import ViewToggle from "./ViewToggle";
import NotesFilter from "./NotesFilter";
import { useDebounce } from "@/hooks/use-debounce";
import NoteCard from "./NoteCard";

const NotesList = () => {
  const [tagId, setTagId] = useState("");
  const [folderId, setFolderId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPinned, setIsPinned] = useState<boolean | undefined>(undefined);
  const [isFavorite, setIsFavorite] = useState<boolean | undefined>(undefined);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [isPending, startTransition] = useTransition();

  const { data, isLoading } = useSuspenseNotes({
    tagId,
    // folderId,
    search: debouncedSearchQuery,
    isPinned: isPinned === true ? true : undefined,
    isFavorite: isFavorite === true ? true : undefined,
  });

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Sort notes to show pinned ones first
  const sortedData = [...data].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const handleSetTagId = (id: string) => {
    startTransition(() => {
      setTagId(id);
    });
  };

  const handleSetFolderId = (id: string) => {
    startTransition(() => {
      setFolderId(id);
    });
  };

  const handleSetIsPinned = (isPinned: boolean | undefined) => {
    startTransition(() => {
      setIsPinned(isPinned);
    });
  };
  const handleSetIsFavorite = (isFavorite: boolean | undefined) => {
    startTransition(() => {
      setIsFavorite(isFavorite);
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-8 p-6 container mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            My Notes
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your thoughts.
          </p>
        </div>
        <div className="flex flex-row items-center gap-6">
          <NotesFilter
            tagId={tagId}
            setTagId={handleSetTagId}
            folderId={folderId}
            setFolderId={handleSetFolderId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isPinned={isPinned}
            setIsPinned={handleSetIsPinned}
            isFavorite={isFavorite}
            setIsFavorite={handleSetIsFavorite}
          />
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      </div>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-[260px] rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 animate-pulse"
              />
            ))}
          </div>
        }
      >
        <div
          className={cn(
            "grid gap-6 w-full transition-all duration-500 ease-in-out",
            viewMode === "list"
              ? "grid-cols-1 max-w-3xl mx-auto"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            isPending ? "opacity-50 scale-[0.99]" : "opacity-100 scale-100"
          )}
        >
          {data.length === 0 ? (
            <div className="col-span-full flex items-center justify-center min-h-[60vh]">
              <EmptyComponent
                title="No Notes Found"
                description="You have no notes yet."
                ButtonText="Create Note"
              />
            </div>
          ) : (
            sortedData.map((note) => (
              <NoteCard key={note.id} note={note} viewMode={viewMode} />
            ))
          )}
        </div>
      </Suspense>
    </div>
  );
};

export default NotesList;
