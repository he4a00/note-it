import CommentsPanel from "@/components/Notes/CommentsPanel";
import NotesEditor from "@/components/Notes/NoteEditor";

const NotePage = async ({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) => {
  const { noteId } = await params;

  return (
    <div className="w-full h-full flex flex-row container mx-auto gap-x-20">
      <NotesEditor noteId={noteId} />
      <CommentsPanel noteId={noteId} />
    </div>
  );
};

export default NotePage;
