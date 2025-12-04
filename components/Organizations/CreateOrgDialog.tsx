"use client";

import { Camera, Check, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateOrganization } from "@/services/organizations/hooks/useOrganization";
import { cn } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";
import { getInitials } from "../account-popup";

interface CreateOrgDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateOrgDialog = ({ open, onOpenChange }: CreateOrgDialogProps) => {
  const [name, setName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const createOrgMutation = useCreateOrganization();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        setImage(res[0].url);
        toast.success("Image uploaded successfully");
      }
    },
    onUploadError: (error: Error) => {
      toast.error("Failed to upload image: " + error.message);
      setImagePreview("");
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL immediately for better UX
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      startUpload([file]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setName("");
      setSlug("");
      setImage("");
      setImagePreview("");
    }
  }, [open]);

  const handleCreate = async () => {
    if (!name.trim()) {
      return;
    }

    await createOrgMutation.mutateAsync({
      name: name.trim(),
      slug: slug.trim() || undefined,
      image: image || undefined,
    });

    onOpenChange(false);
  };

  const isValid = name.trim().length >= 2 && slug.trim().length >= 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] gap-0 p-0 shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-semibold">
            Create an organization
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Organizations help you collaborate with your team and manage
            projects together.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* Avatar Upload Section */}
          <div className="flex items-start gap-4">
            <div
              className="relative group cursor-pointer"
              onClick={triggerFileInput}
            >
              <Avatar className="h-20 w-20 border-2 border-border shadow-sm transition-all group-hover:border-primary">
                <AvatarImage src={image || imagePreview || ""} alt={name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-white text-2xl font-medium">
                  {getInitials(name || "")}
                </AvatarFallback>
              </Avatar>

              {/* Hover Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            <div className="flex-1 pt-1">
              <Label className="text-sm font-medium">Organization logo</Label>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Click the avatar to upload a logo for your organization.
                Recommended size: 256x256px
              </p>
            </div>
          </div>
          {/* Organization Name */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="org-name" className="text-sm font-medium">
                Organization name <span className="text-destructive">*</span>
              </Label>
              <span
                className={cn(
                  "text-xs",
                  name.length > 50
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {name.length}/50
              </span>
            </div>
            <Input
              id="org-name"
              placeholder="Acme Inc."
              value={name}
              onChange={(e) => setName(e.target.value.substring(0, 50))}
              className="h-10"
              autoFocus
            />
            {name.length > 0 && name.length < 2 && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <X className="h-3 w-3" />
                Name must be at least 2 characters
              </p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="org-slug" className="text-sm font-medium">
                Organization Slug
              </Label>
              <span
                className={cn(
                  "text-xs",
                  name.length > 50
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {name.length}/50
              </span>
            </div>
            <Input
              id="org-slug"
              placeholder="acme-inc"
              value={slug}
              onChange={(e) => setSlug(e.target.value.substring(0, 50))}
              className="h-10"
              autoFocus
            />
            {name.length > 0 && name.length < 2 && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <X className="h-3 w-3" />
                Name must be at least 2 characters
              </p>
            )}
          </div>

          {/* URL Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Organization URL</Label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 border border-border">
              <span className="text-sm text-muted-foreground">
                noteit.com/org/
              </span>
              <span className="text-sm font-medium flex-1">
                {slug || "your-org-name"}
              </span>
              {slug && slug.length >= 2 && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/30 border-t">
          <div className="flex items-center justify-between w-full">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={createOrgMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!isValid || createOrgMutation.isPending || isUploading}
              className="min-w-[120px]"
            >
              {createOrgMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create organization"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrgDialog;
