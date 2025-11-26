import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, LayoutTemplate, Check, Copy } from "lucide-react";
import {
  useCreateNote,
  useSuspenseTemplates,
} from "@/services/notes/hooks/useNotes";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";
import { cn } from "@/lib/utils";
import { extractTextFromBlockNote } from "@/lib/utils/extractTextFromBlockNote";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type Template = RouterOutputs["notes"]["getAllTemplates"][number];

interface TemplatesDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSelectTemplate?: (template: Template) => void;
}

const TemplatesDialog = ({
  open,
  onOpenChange,
  trigger,
  onSelectTemplate,
}: TemplatesDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "my" | "builtin">("all");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const templates = useSuspenseTemplates();
  const { data: session } = authClient.useSession();
  const createNoteMutation = useCreateNote();

  // Filter logic (placeholder for now as per original code, but ready to be enabled)
  const filteredTemplates = templates.data?.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.content &&
        extractTextFromBlockNote(template.content)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));
    //  const matchesTab =
    //    activeTab === "all" ||
    //    (activeTab === "my" && template.category === "my") ||
    //    (activeTab === "builtin" && template.category === "builtin");
    return matchesSearch; // && matchesTab;
  });

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Template content copied to clipboard");
  };

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;
    createNoteMutation.mutate(
      {
        title: selectedTemplate.title,
        content: selectedTemplate.content,
        type: selectedTemplate.type,
        folderId: selectedTemplate.folderId,
        tagIds: selectedTemplate.tags.map((tag) => tag.id),
        userId: session?.user.id,
      },
      {
        onSuccess: () => {
          toast.success("Template saved successfully");
          onOpenChange?.(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger !== undefined && (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      )}

      <DialogContent
        className="flex flex-col gap-0 p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border shadow-2xl sm:rounded-xl"
        style={{
          height: "85vh",
          width: "95vw",
          maxHeight: "900px",
          maxWidth: "1400px",
        }}
      >
        <div className="sr-only">
          <DialogTitle>Choose a Template</DialogTitle>
        </div>

        <div className="flex h-full">
          {/* Sidebar / Template List */}
          <div className="w-[320px] md:w-[380px] flex flex-col border-r border-border/50 bg-muted/10">
            {/* Header Section */}
            <div className="p-4 space-y-4 border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50 border-border/50 focus:bg-background transition-all duration-200"
                />
              </div>

              <div className="flex gap-1.5 p-1 bg-muted/50 rounded-lg">
                {(["all", "my", "builtin"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 capitalize",
                      activeTab === tab
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    )}
                  >
                    {tab === "builtin"
                      ? "Built-in"
                      : tab === "my"
                      ? "My Templates"
                      : "All"}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-2">
                {filteredTemplates?.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={cn(
                      "group p-3 rounded-lg cursor-pointer border transition-all duration-200 ease-in-out",
                      selectedTemplate?.id === template.id
                        ? "bg-primary/5 border-primary/20 shadow-[0_0_0_1px_rgba(var(--primary),0.2)]"
                        : "bg-card border-transparent hover:border-border/50 hover:bg-accent/50 hover:shadow-sm"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <h3
                        className={cn(
                          "font-medium text-sm transition-colors",
                          selectedTemplate?.id === template.id
                            ? "text-primary"
                            : "text-foreground group-hover:text-primary/80"
                        )}
                      >
                        {template.title}
                      </h3>
                      {selectedTemplate?.id === template.id && (
                        <Check className="w-3.5 h-3.5 text-primary animate-in fade-in zoom-in duration-200" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {extractTextFromBlockNote(template.content).slice(
                        0,
                        100
                      ) || "No preview available"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 h-5 font-normal bg-muted text-muted-foreground"
                      >
                        {template.user.email?.split("@")[0]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Preview Area */}
          <div className="flex-1 flex flex-col bg-background h-full overflow-hidden relative">
            {selectedTemplate ? (
              <>
                <div className="flex-1 overflow-hidden flex flex-col">
                  {/* Preview Header */}
                  <div className="p-8 pb-6 border-b border-border/40">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                          {selectedTemplate.title}
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Created by</span>
                          <span className="font-medium text-foreground">
                            {selectedTemplate.user.name ||
                              selectedTemplate.user.email}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          handleCopyContent(
                            extractTextFromBlockNote(selectedTemplate.content)
                          )
                        }
                        title="Copy content"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Preview Content */}
                  <ScrollArea className="flex-1 h-0">
                    <div className="p-8 max-w-3xl mx-auto">
                      <div className="p-6 rounded-xl border border-border/40 bg-muted/10 shadow-sm">
                        <p className="font-sans text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                          {extractTextFromBlockNote(
                            selectedTemplate.content,
                            Infinity
                          )}
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </div>

                {/* Footer Actions */}
                {selectedTemplate.userId === session?.user.id ? (
                  <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm flex justify-end gap-3 items-center">
                    <Link href={`/dashboard/${selectedTemplate.id}`}>
                      <Button
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Preview in editor
                      </Button>
                    </Link>
                    <Separator orientation="vertical" className="h-6" />
                    <Button
                      onClick={() => {
                        onSelectTemplate?.(selectedTemplate);
                        onOpenChange?.(false);
                      }}
                      className="shadow-md hover:shadow-lg transition-all duration-200 px-6"
                    >
                      Use Template
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm flex justify-end gap-3 items-center">
                    <Button
                      onClick={() => {
                        handleSaveTemplate();
                      }}
                      className="shadow-md hover:shadow-lg transition-all duration-200 px-6"
                    >
                      Use Template
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
                  <LayoutTemplate className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">
                  No template selected
                </h3>
                <p className="text-sm max-w-xs text-center text-muted-foreground/80">
                  Select a template from the list to view its details and use it
                  in your note.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatesDialog;
