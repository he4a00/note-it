import { LayoutGrid, ListIcon, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  viewMode: "grid" | "list";
  setViewMode: (viewMode: "grid" | "list") => void;
}

const ViewToggle = ({ viewMode, setViewMode }: ViewToggleProps) => {
  return (
    <div>
      <div className="flex items-center rounded-md border w-[6rem] justify-center h-12 border-zinc-200 bg-white p-1 shadow-sm dark:bg-secondary dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "rounded-sm p-1.5 transition-all hover:bg-zinc-100 cursor-pointer dark:hover:bg-zinc-800",
              viewMode === "grid"
                ? "bg-zinc-100 text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-500"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "rounded-sm p-1.5 transition-all hover:bg-zinc-100 cursor-pointer dark:hover:bg-zinc-800",
              viewMode === "list"
                ? "bg-zinc-100 text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-500"
            )}
          >
            <ListIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewToggle;
