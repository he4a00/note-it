import NotesEditor from "@/components/Notes/NoteEditor";

const NotePage = async ({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) => {
  const { noteId } = await params;

  return (
    <div className="px-20 py-10">
      <NotesEditor noteId={noteId} />
    </div>
  );
};

export default NotePage;
