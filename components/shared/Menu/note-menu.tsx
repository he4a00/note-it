import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import { MoreHorizontal, Share } from "lucide-react";
import ExportMenu from "./export-menu";
import DeleteNoteMenu from "./delete-note-menu";
import { BlockNoteEditor } from "@blocknote/core";
import ShareDialog from "./share-dialog";

interface NoteMenuProps {
  editor?: BlockNoteEditor | null;
  noteTitle?: string;
  readOnly?: boolean;
}

const NoteMenu = ({ editor, noteTitle, readOnly = false }: NoteMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <ExportMenu editor={editor} noteTitle={noteTitle} />
        {!readOnly && (
          <>
            <DeleteNoteMenu />
            <ShareDialog />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NoteMenu;
