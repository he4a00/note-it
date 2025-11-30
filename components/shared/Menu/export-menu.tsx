import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../../ui/dropdown-menu";
import {
  Crown,
  Download,
  File,
  FileCode,
  FileText,
  Loader2,
} from "lucide-react";
import { BlockNoteEditor } from "@blocknote/core";
import { exportToPDF } from "@/lib/pdf-export";
import { toast } from "sonner";

interface ExportMenuProps {
  editor?: BlockNoteEditor | null;
  noteTitle?: string;
}

const ExportMenu = ({ editor, noteTitle = "document" }: ExportMenuProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handlePDFExport = async () => {
    if (!editor) {
      toast.error("Editor is not available. Please try again.");
      return;
    }

    setIsExporting(true);
    try {
      await exportToPDF(editor, noteTitle || "document");
      toast.success(`${noteTitle}.pdf has been downloaded.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to export PDF"
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="">
          <Download className="mr-2 h-4 w-4" />
          <span>Export</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handlePDFExport}
            disabled={isExporting || !editor}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            <span>PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <FileCode className="mr-2 h-4 w-4" />
            <span>HTML</span>
            <Crown className="text-yellow-500" />
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <File className="mr-2 h-4 w-4" />
            <span>Markdown</span>
            <Crown className="text-yellow-500" />
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenu>
  );
};

export default ExportMenu;
