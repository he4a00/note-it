import { useState, Activity } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Share, Copy, Check, Globe, Lock } from "lucide-react";
import { useNote, useTogglePublicShare } from "@/services/notes/hooks/useNotes";
import { usePathname } from "next/navigation";

const ShareDialog = () => {
  const [open, setOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();
  const noteId = pathname.split("/")[2];
  const { data: noteData, isLoading: isLoadingNote } = useNote(noteId);

  const shareMutation = useTogglePublicShare();

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/${noteData?.shareId}`
      : "";

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleToggle = (checked: boolean) => {
    setIsPublic(checked);
    shareMutation.mutate({ id: noteId || "", isPublic: checked });
  };
  const handleShare = () => {
    shareMutation.mutateAsync({
      id: noteId || "",
      isPublic,
    });
    setOpen(false);
  };

  return (
    <>
      <DropdownMenuItem
        className="cursor-pointer"
        onSelect={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
      >
        <Share className="mr-2 h-4 w-4" />
        <span>Share</span>
      </DropdownMenuItem>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share className="h-5 w-5" />
              Share Note
            </DialogTitle>
            <DialogDescription>
              Share this note with others by copying the link below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* URL Input Section - uses Activity to show/hide while preserving state */}
            <Activity mode={noteData?.shareId ? "visible" : "hidden"}>
              <div className="space-y-2">
                <Label htmlFor="share-url" className="text-sm font-medium">
                  Share Link
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="share-url"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-muted/50"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={handleCopyUrl}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Activity>

            {/* Visibility Toggle Section */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <Globe className="h-5 w-5 text-green-500" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="space-y-0.5">
                  <Label htmlFor="visibility" className="text-sm font-medium">
                    {isPublic ? "Public" : "Private"}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {isPublic
                      ? "Anyone with the link can view this note"
                      : "Only you can access this note"}
                  </p>
                </div>
              </div>
              <Switch
                id="visibility"
                checked={isPublic}
                onCheckedChange={handleToggle}
                disabled={shareMutation.isPending}
              />
            </div>
          </div>

          <DialogFooter className="flex-row justify-end gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleShare}>
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareDialog;
