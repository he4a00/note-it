"use client";

import { useSuspenseNotes } from "@/services/notes/hooks/useNotes";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { extractTextFromBlockNote } from "@/lib/utils/extractTextFromBlockNote";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, Pin, FileText, Sparkles, Heart } from "lucide-react";
import { motion } from "framer-motion";
import NoteToolbox from "./NoteToolbox";
import { Suspense, useState, useTransition } from "react";
import { EmptyComponent } from "../shared/entity-components";
import ViewToggle from "./ViewToggle";
import NotesFilter from "./NotesFilter";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDistanceToNow } from "date-fns";

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
                className="h-[240px] rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse"
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
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="group relative"
              >
                <Card
                  className={cn(
                    "cursor-pointer h-[240px] flex flex-col justify-between relative overflow-hidden transition-all duration-300",
                    "border-zinc-200 dark:border-zinc-800",
                    "hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-1",
                    "bg-white dark:bg-zinc-900/50"
                  )}
                >
                  {/* Template || Note Badge */}
                  <div className="absolute top-0 left-0 p-3 z-10">
                    <Badge
                      variant="secondary"
                      className="h-6 px-2 text-[10px] font-medium bg-zinc-100/80 dark:bg-zinc-800/80 border-0"
                    >
                      {note.type === "TEMPLATE" ? (
                        <>
                          <Sparkles className="h-3 w-3 mr-1 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">
                            Template
                          </span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-3 w-3 mr-1 text-blue-500" />
                          <span className="text-blue-600 dark:text-blue-400">
                            Note
                          </span>
                        </>
                      )}
                    </Badge>
                  </div>

                  {note.isPinned && (
                    <div className="absolute top-0 right-0 p-3 z-10">
                      <Pin className="h-4 w-4 text-orange-500 fill-orange-500/20 transform rotate-45" />
                    </div>
                  )}
                  {note.isFavorite && (
                    <div
                      className={cn(
                        "absolute top-0 p-3 z-10",
                        note.isPinned ? "right-6" : "right-0"
                      )}
                    >
                      <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                    </div>
                  )}

                  <NoteToolbox noteId={note.id} />

                  <CardHeader className="p-5 pb-2">
                    <CardTitle className="line-clamp-1 font-serif text-lg font-semibold tracking-tight">
                      {note.title || (
                        <span className="text-muted-foreground italic">
                          Untitled Note
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 mt-1 font-serif text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {extractTextFromBlockNote(note.content) ||
                        "No additional text"}
                    </CardDescription>
                  </CardHeader>

                  <CardFooter className="p-5 pt-0 items-end mt-auto">
                    <div className="flex flex-row justify-between items-center w-full pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                      <div className="flex flex-row gap-2 overflow-hidden mask-linear-fade">
                        {note.tags.slice(0, 3).map((tag) => (
                          <Badge
                            variant="secondary"
                            key={tag.id}
                            className="flex flex-row items-center gap-1.5 px-2 py-0.5 h-6 text-[10px] font-medium bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border-0"
                          >
                            <span
                              style={{ backgroundColor: tag.color }}
                              className="w-1.5 h-1.5 rounded-full"
                            ></span>
                            {tag.name}
                          </Badge>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="text-[10px] text-muted-foreground self-center">
                            +{note.tags.length - 3}
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 text-[10px] font-medium whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(note.updatedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </Suspense>
    </div>
  );
};

export default NotesList;
