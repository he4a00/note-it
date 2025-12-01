import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Plus, FileText, Crown, Building2 } from "lucide-react";
import TemplatesDialog from "./TemplatesDialog";
import { useCreateNote } from "@/services/notes/hooks/useNotes";
import { useRouter } from "next/navigation";
import CreateOrgDilaog from "../Organizations/CreateOrgDialog";

const NewDropDown = ({ text }: { text?: string }) => {
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const createNoteMutation = useCreateNote();
  const router = useRouter();

  const handleCreateBlankNote = async () => {
    const newNote = await createNoteMutation.mutateAsync({
      title: "Untitled",
      content: "[]",
      folderId: null,
      type: "NOTE",
      tagIds: [],
      visibility: "PRIVATE",
      orgId: null,
    });

    router.push(`/dashboard/${newNote.id}`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className="bg-primary dark:bg-primary text-primary-foreground hover:bg-transparent dark:hover:bg-transparent"
        >
          <Button variant="outline" className="">
            {text || "+ New"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[280px] p-2 border-border/50 shadow-xl"
        >
          <div className="space-y-1.5">
            {/* Blank Note */}
            <DropdownMenuItem
              className="group px-3 py-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] focus:bg-transparent border border-transparent hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/10"
              onSelect={handleCreateBlankNote}
            >
              <div className="flex items-center gap-3.5 w-full">
                <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110">
                  <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
                  <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="font-semibold text-sm text-foreground group-hover:text-blue-600 transition-colors duration-200">
                    Blank Note
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Start from scratch
                  </div>
                </div>
              </div>
            </DropdownMenuItem>

            {/* Use Template */}
            <DropdownMenuItem
              className="group px-3 py-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] focus:bg-transparent border border-transparent hover:border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/10"
              onSelect={() => setTemplateDialogOpen(true)}
            >
              <div className="flex items-center gap-3.5 w-full">
                <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-md group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110">
                  <FileText className="w-5 h-5 text-white" strokeWidth={2.5} />
                  <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex-1 flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <div className="font-semibold text-sm text-foreground group-hover:text-purple-600 transition-colors duration-200">
                      Use Template
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Choose a preset
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-sm group-hover:shadow-yellow-500/50 transition-all duration-300 group-hover:rotate-12">
                    <Crown className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </DropdownMenuItem>

            {/* New Organization */}
            <DropdownMenuItem
              className="group px-3 py-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] focus:bg-transparent border border-transparent hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/10"
              onSelect={() => setOrgDialogOpen(true)}
            >
              <div className="flex items-center gap-3.5 w-full">
                <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md group-hover:shadow-emerald-500/50 transition-all duration-300 group-hover:scale-110">
                  <Building2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                  <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex-1 flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <div className="font-semibold text-sm text-foreground group-hover:text-emerald-600 transition-colors duration-200">
                      New Organization
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Create a workspace
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-sm group-hover:shadow-yellow-500/50 transition-all duration-300 group-hover:rotate-12">
                    <Crown className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <TemplatesDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
      />
      <CreateOrgDilaog open={orgDialogOpen} onOpenChange={setOrgDialogOpen} />
    </>
  );
};

export default NewDropDown;
