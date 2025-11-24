import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import NotesEditor from "./NoteEditor";
import CreateNoteHeader from "./CreateNoteHeader";
import { useCreateNote } from "@/services/notes/hooks/useNotes";
import { Input } from "../ui/input";

const CreateNoteModel = () => {
  const [tagsId, setTagsId] = useState<string[]>([]);
  const [folderId, setFolderId] = useState<string>("");
  const [noteTitle, setNoteTitle] = useState<string>("");
  const [noteContent, setNoteContent] = useState<string>("");

  const createNoteMutation = useCreateNote();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="ml-10">
          + New Note
        </Button>
      </DialogTrigger>
      <DialogContent
        className="flex flex-col gap-10 overflow-y-auto"
        style={{
          height: "80%",
          width: "50%",
          maxHeight: "80%",
          maxWidth: "50%",
        }}
      >
        <DialogTitle>
          <Input
            placeholder="Note Title"
            className="w-[60%]"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
              boxShadow: "none",
              fontSize: "1.5rem",
            }}
          />
        </DialogTitle>
        <CreateNoteHeader
          tagsId={tagsId}
          setTagsId={setTagsId}
          folderId={folderId}
          setFolderId={setFolderId}
        />
        <NotesEditor
          noteContent={noteContent}
          setNoteContent={setNoteContent}
        />
        <DialogFooter className="">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            className="absolute top-22"
            disabled={createNoteMutation.isPending || folderId === ""}
            onClick={() =>
              createNoteMutation.mutateAsync({
                tagIds: tagsId,
                folderId: folderId,
                content: noteContent,
                title: noteTitle,
              })
            }
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNoteModel;
