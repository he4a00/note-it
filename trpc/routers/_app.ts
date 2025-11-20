import { coursesRouter } from "@/services/courses/server/routers";
import { createTRPCRouter } from "../init";
import { subjectsRouter } from "@/services/subjects/server/router";
export const appRouter = createTRPCRouter({
  courses: coursesRouter,
  subjects: subjectsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
