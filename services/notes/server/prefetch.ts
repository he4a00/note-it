import { prefetch, trpc } from "@/trpc/server";
import { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.notes.getAllNotes>;
type InputTemplates = inferInput<typeof trpc.notes.getAllTemplates>;

export const prefetchNotes = async (params: Input) => {
  return prefetch(trpc.notes.getAllNotes.queryOptions(params));
};

export const prefetchTemplates = async (params: InputTemplates) => {
  return prefetch(trpc.notes.getAllTemplates.queryOptions(params));
};
