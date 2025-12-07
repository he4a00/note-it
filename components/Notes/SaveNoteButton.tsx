import { useUpdateNote } from "@/services/notes/hooks/useNotes";
import { Button } from "../ui/button";
import { Check, Loader2 } from "lucide-react";

const SaveNoteButton = ({
  noteId,
  currentContent,
  title,
  tagsId,
  folderId,
  noteType,
  orgId,
}: {
  noteId: string;
  currentContent: string;
  title: string;
  tagsId: string[];
  folderId: string;
  noteType: "NOTE" | "TEMPLATE";
  orgId: string;
}) => {
  const updateNoteMutation = useUpdateNote();

  return (
    <Button
      onClick={() =>
        updateNoteMutation.mutate({
          id: noteId!,
          content: currentContent,
          title,
          tagIds: tagsId,
          folderId: folderId || null,
          type: noteType,
          orgId,
        })
      }
      disabled={updateNoteMutation.isPending}
      aria-label="Save note"
      className="w-8 h-8 p-0"
      variant="ghost"
    >
      {updateNoteMutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Check className="h-4 w-4" />
      )}
    </Button>
  );
};

export default SaveNoteButton;
