import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useDeleteNote } from "@/services/notes/hooks/useNotes";
import { Trash } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const DeleteNoteMenu = () => {
  const deleteNoteMutation = useDeleteNote();
  const pathname = usePathname();
  const router = useRouter();
  const noteId = pathname.split("/")[2];

  const handleDeleteNote = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await deleteNoteMutation.mutateAsync({ id: noteId });
      router.push("/dashboard");
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };
  return (
    <DropdownMenuItem
      onClick={handleDeleteNote}
      disabled={deleteNoteMutation.isPending}
      className="text-destructive focus:text-destructive cursor-pointer"
    >
      <Trash className="mr-2 h-4 w-4" />
      <span>Delete</span>
    </DropdownMenuItem>
  );
};

export default DeleteNoteMenu;
