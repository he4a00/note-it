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
import { Calendar, Pin } from "lucide-react";
import { motion } from "framer-motion";
import NoteToolbox from "./NoteToolbox";
import { Suspense, useState, useTransition } from "react";
import { EmptyComponent } from "../shared/entity-components";
import ViewToggle from "./ViewToggle";
import NotesFilter from "./NotesFilter";
import { useDebounce } from "@/hooks/use-debounce";

const NotesList = () => {
  const [tagId, setTagId] = useState("");
  const [folderId, setFolderId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [isPending, startTransition] = useTransition();

  const { data, isLoading } = useSuspenseNotes({
    tagId,
    // folderId,
    search: debouncedSearchQuery,
    isPinned,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

  const handleSetIsPinned = (isPinned: boolean) => {
    startTransition(() => {
      setIsPinned(isPinned);
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-2xl font-bold">Recent Notes</h1>
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
          />
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 py-10 w-full transition-all",
            viewMode === "list" ? "lg:grid-cols-1 px-30 py-10" : "grid-cols-3",
            isPending ? "opacity-50" : "opacity-100"
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
            data.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "group relative flex flex-col justify-between rounded-xl transition-all hover:border-zinc-300 hover:shadow-md"
                )}
              >
                <Card
                  className={cn(
                    "cursor-pointer hover:shadow-lg transition-shadow h-[200px] flex flex-col justify-between relative"
                  )}
                >
                  {note.isPinned && (
                    <Pin className="h-4 w-4 text-orange-500 fill-orange-500/20 transform -rotate-45 absolute top-6 right-5" />
                  )}
                  <NoteToolbox noteId={note.id} />
                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {note.title || "Untitled Note"}
                    </CardTitle>
                    <CardDescription className="line-clamp-4 mt-2">
                      {extractTextFromBlockNote(note.content)}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="items-end">
                    <div className="flex flex-row justify-between w-full">
                      <div className="flex flex-row gap-3">
                        {note.tags.map((tag) => (
                          <Badge
                            variant="outline"
                            key={tag.id}
                            className="flex flex-row items-center gap-2"
                          >
                            <span
                              style={{ backgroundColor: tag.color }}
                              className={cn(`w-3 h-3 rounded-full`)}
                            ></span>{" "}
                            {tag.name.slice(0, 1).toUpperCase() +
                              tag.name.slice(1)}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-row items-center gap-2">
                        <Calendar size={15} color="gray" />
                        <p className="text-gray-400 text-sm font-medium">
                          {note.updatedAt.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
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
