import { useQueryStates } from "nuqs";
import { activitiesParams } from "../params";

export const useOrganizationsParams = () => {
  return useQueryStates(activitiesParams);
};
