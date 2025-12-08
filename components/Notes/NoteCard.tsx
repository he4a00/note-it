"use client";

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
import { Pin, FileText, Sparkles, Heart, Clock } from "lucide-react";
import { motion } from "framer-motion";
import NoteToolbox from "./NoteToolbox";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Checkbox } from "../ui/checkbox";
import { useState } from "react";

export interface NoteCardProps {
  note: {
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
  };
  viewMode?: "grid" | "list";
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const NoteCard = ({
  note,
  viewMode = "grid",
  selectedIds,
  setSelectedIds,
}: NoteCardProps) => {
  const isListView = viewMode === "list";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative"
    >
      <Card
        className={cn(
          "cursor-pointer relative overflow-hidden transition-all duration-300",
          "border-zinc-200/80 dark:border-zinc-800/80",
          "hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50",
          "hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-1",
          "bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900/80 dark:to-zinc-950/50",
          isListView
            ? "flex flex-row items-center h-auto min-h-[100px] p-4 gap-4"
            : "h-[260px] flex flex-col justify-between"
        )}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-zinc-100/30 dark:to-zinc-800/20 pointer-events-none" />

        {/* Type Badge */}
        <div
          className={cn(
            "absolute z-10 flex flex-row gap-2 items-center",
            isListView ? "top-2 left-2" : "top-0 left-0 p-3"
          )}
        >
          <Checkbox
            className="cursor-pointer border-zinc-200/90 dark:border-zinc-800/80"
            checked={selectedIds.includes(note.id)}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedIds((prev) => [...prev, note.id]);
              } else {
                setSelectedIds((prev) => prev.filter((id) => id !== note.id));
              }
            }}
          />
          <Badge
            variant="secondary"
            className={cn(
              "h-6 px-2.5 text-[10px] font-semibold tracking-wide uppercase",
              "backdrop-blur-sm border shadow-sm",
              note.type === "TEMPLATE"
                ? "bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-200/50 dark:border-emerald-800/50"
                : "bg-blue-50/90 dark:bg-blue-950/60 border-blue-200/50 dark:border-blue-800/50"
            )}
          >
            {note.type === "TEMPLATE" ? (
              <>
                <Sparkles className="h-3 w-3 mr-1.5 text-emerald-500" />
                <span className="text-emerald-700 dark:text-emerald-400">
                  Template
                </span>
              </>
            ) : (
              <>
                <FileText className="h-3 w-3 mr-1.5 text-blue-500" />
                <span className="text-blue-700 dark:text-blue-400">Note</span>
              </>
            )}
          </Badge>
        </div>

        {/* Status Icons */}
        <div
          className={cn(
            "absolute z-10 flex items-center gap-1",
            isListView ? "top-2 right-2" : "top-0 right-0 p-3"
          )}
        >
          {note.isPinned && (
            <div className="p-1 rounded-full bg-orange-50/80 dark:bg-orange-950/60">
              <Pin className="h-3.5 w-3.5 text-orange-500 fill-orange-500/30 transform rotate-45" />
            </div>
          )}
          {note.isFavorite && (
            <div className="p-1 rounded-full bg-red-50/80 dark:bg-red-950/60">
              <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            </div>
          )}
        </div>

        <NoteToolbox noteId={note.id} />

        {/* Content Area */}
        <div
          className={cn(
            isListView ? "flex-1 min-w-0 pr-20" : "flex-1 flex flex-col"
          )}
        >
          <CardHeader className={cn(isListView ? "p-0" : "p-5 pb-2 pt-12")}>
            <CardTitle
              className={cn(
                "line-clamp-1 font-serif font-semibold tracking-tight",
                "text-zinc-900 dark:text-zinc-50",
                isListView ? "text-base" : "text-lg"
              )}
            >
              {note.title || (
                <span className="text-muted-foreground/70 italic font-normal">
                  Untitled Note
                </span>
              )}
            </CardTitle>
            <CardDescription
              className={cn(
                "font-serif leading-relaxed text-zinc-500 dark:text-zinc-400",
                isListView
                  ? "line-clamp-1 text-sm mt-0.5"
                  : "line-clamp-3 text-sm mt-2"
              )}
            >
              {extractTextFromBlockNote(note.content) || "No additional text"}
            </CardDescription>
          </CardHeader>
        </div>

        {/* Footer */}
        <CardFooter
          className={cn(
            isListView ? "p-0 flex-shrink-0" : "p-5 pt-0 items-end mt-auto"
          )}
        >
          <div
            className={cn(
              "flex items-center w-full",
              isListView
                ? "gap-3"
                : "flex-row justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50"
            )}
          >
            {/* Tags */}
            <div
              className={cn(
                "flex items-center gap-1.5 overflow-hidden",
                isListView ? "flex-shrink-0" : "flex-1"
              )}
            >
              {note.tags.slice(0, isListView ? 2 : 3).map((tag) => (
                <Badge
                  variant="secondary"
                  key={tag.id}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 h-6",
                    "text-[10px] font-medium",
                    "bg-zinc-100/80 dark:bg-zinc-800/80",
                    "text-zinc-600 dark:text-zinc-400",
                    "border-0 shadow-sm"
                  )}
                >
                  <span
                    style={{ backgroundColor: tag.color }}
                    className="w-2 h-2 rounded-full ring-1 ring-white/20"
                  />
                  <span className="truncate max-w-[60px]">{tag.name}</span>
                </Badge>
              ))}
              {note.tags.length > (isListView ? 2 : 3) && (
                <span className="text-[10px] text-muted-foreground font-medium">
                  +{note.tags.length - (isListView ? 2 : 3)}
                </span>
              )}
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500 flex-shrink-0">
              <Clock className="h-3 w-3" />
              <p className="text-[10px] font-medium whitespace-nowrap">
                {formatDistanceToNow(new Date(note.updatedAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default NoteCard;
