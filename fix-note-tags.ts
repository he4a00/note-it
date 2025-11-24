import prisma from "./lib/db";

async function fixNoteTags() {
  const noteId = "cmibs4xuu0003moqon4knofjv";

  // First, let's see what tags exist for this user
  const userId = "bblQnsw8n49m165ditUsPFulzucYWwvN";

  const allTags = await prisma.tag.findMany({
    where: { userId },
  });

  console.log("Available tags:", allTags);

  if (allTags.length === 0) {
    console.log("No tags found. Please create tags first.");
    return;
  }

  // Let's assign the first tag to this note as an example
  // Replace with the actual tag IDs you want to assign
  const tagIdsToAssign = allTags.slice(0, 2).map((tag) => tag.id);

  console.log(
    `\nAssigning tags ${tagIdsToAssign.join(", ")} to note ${noteId}...`
  );

  const updatedNote = await prisma.note.update({
    where: { id: noteId },
    data: {
      tags: {
        connect: tagIdsToAssign.map((id) => ({ id })),
      },
    },
    include: {
      tags: true,
      folder: true,
    },
  });

  console.log("\nUpdated note:", JSON.stringify(updatedNote, null, 2));

  // Verify the join table now has data
  const joinTableData = await prisma.$queryRaw`
    SELECT * FROM "_NoteToTag" WHERE "A" = ${noteId};
  `;

  console.log("\nJoin table data:", joinTableData);
}

fixNoteTags()
  .catch(console.error)
  .finally(() => process.exit());
