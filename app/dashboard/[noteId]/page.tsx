import NotesEditor from "@/components/Notes/NoteEditor";

const NotePage = async ({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) => {
  const { noteId } = await params;

  return (
    <div className="w-full h-full">
      <NotesEditor noteId={noteId} />
    </div>
  );
};

export default NotePage;
