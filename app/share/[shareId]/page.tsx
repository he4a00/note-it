import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import SharedNoteViewer from "@/components/Notes/SharedNoteViewer";

export default async function SharedNotePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;

  const note = await prisma.note.findFirst({
    where: { shareId },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  // If no note or not public -> 404
  if (!note || note.visibility !== "PUBLIC") {
    notFound();
  }

  return <SharedNoteViewer note={note} />;
}
