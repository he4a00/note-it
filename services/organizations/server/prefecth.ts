import { prefetch, trpc } from "@/trpc/server";

export const prefetchOrgById = async (id: string) => {
  return prefetch(trpc.organization.getOrgById.queryOptions({ id }));
};
