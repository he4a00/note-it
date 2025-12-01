"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { Briefcase, Calendar, Trash, Users } from "lucide-react";
import { useDeleteOrganization } from "@/services/organizations/hooks/useOrganization";
import { useRouter } from "next/navigation";

const OrgHeader = ({
  orgId,
  orgName,
  image,
  orgSlug,
  membersCount,
  createdAt,
}: {
  orgId: string;
  orgName: string;
  image: string;
  orgSlug: string;
  membersCount: number;
  createdAt: Date;
}) => {
  const deleteOrgMutation = useDeleteOrganization();
  const router = useRouter();
  const handleDelete = () => {
    deleteOrgMutation.mutateAsync(
      { id: orgId },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
      }
    );
  };
  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center justify-between">
        {/* Title and image */}
        <div className="flex flex-row items-center gap-2">
          <Image
            width={70}
            height={70}
            src={image || "/placeholder.png"}
            alt={orgName}
            className="rounded-2xl"
          />
          <div className="flex flex-col gap-y-1">
            <h1 className="text-4xl font-bold">{orgName}</h1>
            <p className="text-gray-500 font-medium text-md">
              noteit.com/{orgSlug}
            </p>
          </div>
        </div>
        {/* CTA Buttons */}
        <div className="flex flex-row gap-4">
          <Button size="lg" variant="outline" className="">
            <Users /> Create Team
          </Button>
          <Button size="lg" className="">
            <Users /> Invite Members
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleteOrgMutation.isPending}
            variant="destructive"
            size="lg"
            className=""
          >
            <Trash />
          </Button>
        </div>
      </div>
      {/* Statistcis */}
      <div className="flex flex-row gap-6 mt-5 ml-2">
        <div className="flex flex-row items-center gap-2">
          <Users size={14} color="gray" />
          <p className="text-gray-500 text-sm">{membersCount}</p>
          <p className="text-gray-500 text-sm">Members</p>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Briefcase size={14} color="gray" />
          <p className="text-gray-500 text-sm">0</p>
          <p className="text-gray-500 text-sm">Teams</p>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Calendar size={14} color="gray" />
          <p className="text-gray-500 text-sm">Created</p>
          <p className="text-gray-500 text-sm">
            {createdAt.toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrgHeader;
