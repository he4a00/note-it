import { notesRouter } from "@/services/notes/server/router";
import { createTRPCRouter } from "../init";
import { tagsRouter } from "@/services/tags/server/router";
import { foldersRouter } from "@/services/folders/server/router";
import { notificationsRouter } from "@/services/notifications/server/router";
import { userRouter } from "@/services/user/server/router";

export const appRouter = createTRPCRouter({
  notes: notesRouter,
  tags: tagsRouter,
  folders: foldersRouter,
  notifications: notificationsRouter,
  user: userRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
