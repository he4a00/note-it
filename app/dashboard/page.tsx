import NotesList from "@/components/Notes/NotesList";
import { requireAuth } from "@/lib/auth-utils";
import { prefetchNotes } from "@/services/notes/server/prefetch";

const DashboardPage = async () => {
  await requireAuth();
  prefetchNotes();
  return (
    <div>
      <NotesList />
    </div>
  );
};

export default DashboardPage;
