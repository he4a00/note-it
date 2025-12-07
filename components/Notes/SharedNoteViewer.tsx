"use client";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { formatDistanceToNow } from "date-fns";
import { Globe, Calendar, User, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface SharedNoteViewerProps {
  note: {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    user?: {
      name: string;
      image?: string | null;
    };
  };
}

export default function SharedNoteViewer({ note }: SharedNoteViewerProps) {
  const editor = useCreateBlockNote({
    // Make it non-editable
  });
  const { theme } = useTheme();

  useEffect(() => {
    async function loadContent() {
      if (editor && note.content) {
        try {
          const blocks = JSON.parse(note.content);
          editor.replaceBlocks(editor.document, blocks);
        } catch (e) {
          console.error("Failed to parse note content:", e);
        }
      }
    }
    loadContent();
  }, [editor, note.content]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4 text-green-500" />
              <span className="font-medium">Shared Note</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                <span>Read Only</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Article Header */}
        <article className="bg-white dark:bg-slate-900/50 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
          {/* Header Section */}
          <div className="px-8 pt-10 pb-6 border-b border-slate-100 dark:border-slate-800/50">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
              {note.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              {note.user && (
                <div className="flex items-center gap-2">
                  {note.user.image ? (
                    <img
                      src={note.user.image}
                      alt={note.user.name}
                      className="h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-800"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {note.user.name}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  Updated{" "}
                  {formatDistanceToNow(new Date(note.updatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-8">
            <div className="font-serif">
              <BlockNoteView
                editor={editor}
                theme={theme === "dark" ? bnTheme.dark : bnTheme.light}
                editable={false}
                className={cn(
                  "min-h-[300px]",
                  "font-serif text-lg leading-relaxed",
                  "[&_.bn-editor]:px-0",
                  "[&_.bn-block-content]:text-foreground/90"
                )}
              />
            </div>
          </div>
        </article>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Globe className="h-4 w-4 text-green-500" />
            This note was shared publicly
          </p>
        </footer>
      </main>
    </div>
  );
}
