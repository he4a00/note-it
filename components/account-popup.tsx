"use client";

import { Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUploadThing } from "@/lib/uploadthing";
import { useGetUser, useUpdateUser } from "@/services/user/hooks/useUser";
import { toast } from "sonner";

interface AccountDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    name: string;
    email: string;
    image: string;
    id: string;
  };
}

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const AccountDetails = ({ open, onOpenChange, user }: AccountDetailsProps) => {
  const { data: loggedUser } = useGetUser(user?.id || "");
  const updateUserMutation = useUpdateUser();
  const [displayName, setDisplayName] = useState(
    loggedUser?.name || user?.name || ""
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res: { url: string }[]) => {
      if (res && res[0]) {
        updateUserMutation.mutate({
          name: displayName,
          image: res[0].url,
        });
      }
    },
    onUploadError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      startUpload([file]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUserUpdate = () => {
    updateUserMutation.mutate({
      name: displayName,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] gap-6 p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-normal">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-4 shadow-sm">
              <AvatarImage
                src={loggedUser?.image || ""}
                alt={loggedUser?.name}
              />
              <AvatarFallback className="bg-[#1AB394] text-white text-3xl font-normal">
                {getInitials(loggedUser?.name || "")}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full transition-colors"
              onClick={triggerFileInput}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              <span className="sr-only">Change avatar</span>
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          <div className="w-full space-y-4">
            <div className="group relative rounded-lg border border-primary px-3 py-2 ">
              <Label
                htmlFor="display-name"
                className="text-xs text-gray-400 font-normal"
              >
                Display Name
              </Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-auto border-0 bg-transparent p-0 text-sm focus-visible:ring-0 font-medium"
                style={{
                  boxShadow: "none",
                }}
              />
            </div>

            {/* <div className="group relative rounded-lg border border-[#333] bg-[#262626] px-3 py-2 focus-within:ring-1 focus-within:ring-white/20 transition-all hover:border-[#444]">
              <Label
                htmlFor="username"
                className="text-xs text-gray-400 font-normal"
              >
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-auto border-0 bg-transparent p-0 text-sm placeholder:text-gray-500 focus-visible:ring-0 text-white font-medium"
              />
            </div> */}

            <p className="text-[13px] text-gray-400 leading-relaxed text-center px-2">
              Your profile helps people recognize you. Your name and username
              are also used in the Note-it app.
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className=""
          >
            Cancel
          </Button>
          <Button
            className=""
            onClick={handleUserUpdate}
            disabled={updateUserMutation.isPending}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDetails;
