import CommentsPanel from "@/components/Notes/CommentsPanel";
import NotesEditor from "@/components/Notes/NoteEditor";

const NotePage = async ({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) => {
  const { noteId } = await params;

  return (
    <div className="w-full h-full min-h-screen flex flex-col lg:flex-row container mx-auto gap-8 lg:gap-20 p-4 lg:p-8">
      <NotesEditor noteId={noteId} />
      <div className="w-full lg:w-[400px] lg:shrink-0 flex justify-center lg:block">
        <CommentsPanel noteId={noteId} />
      </div>
    </div>
  );
};

export default NotePage;
