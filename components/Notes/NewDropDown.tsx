import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Plus, FileText } from "lucide-react";
import TemplatesDialog from "./TemplatesDialog";
import { useCreateNote } from "@/services/notes/hooks/useNotes";
import { useRouter } from "next/navigation";

const NewDropDown = ({ text }: { text?: string }) => {
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const createNoteMutation = useCreateNote();
  const router = useRouter();

  const handleCreateBlankNote = async () => {
    const newNote = await createNoteMutation.mutateAsync({
      title: "Untitled",
      content: "[]",
      folderId: null,
      type: "NOTE",
      tagIds: [],
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
        <DropdownMenuContent align="end" className="w-[300px] p-2">
          <div className="space-y-2">
            <DropdownMenuItem
              className="p-4 cursor-pointer hover:bg-accent rounded-lg transition-colors"
              onSelect={handleCreateBlankNote}
            >
              <div className="flex items-start gap-4 w-full">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-base">Blank Note</div>
                  <div className="text-sm text-muted-foreground">
                    Start writing from scratch.
                  </div>
                </div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="p-4 cursor-pointer hover:bg-accent rounded-lg transition-colors"
              onSelect={() => setTemplateDialogOpen(true)}
            >
              <div className="flex items-start gap-4 w-full">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-base">Use Template...</div>
                  <div className="text-sm text-muted-foreground">
                    Begin with a pre-built layout.
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
    </>
  );
};

export default NewDropDown;
