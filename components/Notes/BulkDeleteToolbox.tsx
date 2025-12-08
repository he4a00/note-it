import { Button } from "../ui/button";
import { Trash2, Pin, Heart, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { motion } from "framer-motion";
import {
  useBulkDelete,
  useBulkToggleFavorite,
  useBulkTogglePin,
} from "@/services/notes/hooks/useNotes";

interface BulkDeleteToolboxProps {
  selectedIds: string[];
  onClearSelection?: () => void;
}

const BulkDeleteToolbox = ({
  selectedIds,
  onClearSelection,
}: BulkDeleteToolboxProps) => {
  const count = selectedIds.length;

  const bulkDeleteMutation = useBulkDelete();
  const bulkTogglePinMutation = useBulkTogglePin();
  const bulkToggleFavoriteMutation = useBulkToggleFavorite();

  const hanldeBulkDelete = () => {
    bulkDeleteMutation.mutateAsync(selectedIds);
  };

  const handleBulkTogglePin = () => {
    bulkTogglePinMutation.mutateAsync(selectedIds);
  };

  const handleBulkToggleFavorite = () => {
    bulkToggleFavoriteMutation.mutateAsync(selectedIds);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-2 px-4 py-3 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-700/50 rounded-2xl shadow-2xl shadow-zinc-900/10 dark:shadow-black/30">
        {/* Selection count badge */}
        <Badge
          variant="secondary"
          className="h-7 px-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 font-semibold text-xs"
        >
          {count} selected
        </Badge>

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={hanldeBulkDelete}
            disabled={bulkDeleteMutation.isPending}
            className="h-9 px-3 gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-sm font-medium">Delete</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleBulkTogglePin}
            disabled={bulkTogglePinMutation.isPending}
            className="h-9 px-3 gap-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50 hover:text-orange-700 dark:hover:text-orange-300 transition-all duration-200"
          >
            <Pin className="h-4 w-4" />
            <span className="text-sm font-medium">Pin</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleBulkToggleFavorite}
            disabled={bulkToggleFavoriteMutation.isPending}
            className="h-9 px-3 gap-2 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/50 hover:text-pink-700 dark:hover:text-pink-300 transition-all duration-200"
          >
            <Heart className="h-4 w-4" />
            <span className="text-sm font-medium">Favorite</span>
          </Button>
        </div>

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        {/* Clear selection button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearSelection}
          className="h-8 w-8 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default BulkDeleteToolbox;
