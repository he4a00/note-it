import { prefetch, trpc } from "@/trpc/server";
import { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.notes.getAll>;

export const prefetchNotes = async (params: Input) => {
  return prefetch(trpc.notes.getAll.queryOptions(params));
};
