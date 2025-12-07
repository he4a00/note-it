import { Users2Icon, XIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { useGetMyOrgs } from "@/services/organizations/hooks/useOrganization";
import Image from "next/image";

interface ChooseOrganizationProps {
  selectedOrgId: string | null;
  onClearOrg: () => void;
  organizationPopoverOpen: boolean;
  setOrganizationPopoverOpen: (open: boolean) => void;
  onSelectOrg: ({ id, name }: { id: string; name: string }) => void;
}

const ChooseOrganization = ({
  selectedOrgId,
  onClearOrg,
  organizationPopoverOpen,
  setOrganizationPopoverOpen,
  onSelectOrg,
}: ChooseOrganizationProps) => {
  const { data: myOrganizations } = useGetMyOrgs();

  // Look up the org name from the ID for display
  const selectedOrgName = myOrganizations?.find(
    (org) => org.id === selectedOrgId
  )?.name;

  return (
    <div className="flex flex-row items-center gap-2">
      {selectedOrgId && selectedOrgName ? (
        <Badge
          variant="outline"
          className="gap-1 pr-1 cursor-pointer hover:bg-accent text-[13px]"
        >
          <Users2Icon className="size-3" />
          {selectedOrgName}
          <button
            onClick={onClearOrg}
            className="rounded-sm hover:bg-destructive/20 p-0.5"
          >
            <XIcon className="size-3" />
          </button>
        </Badge>
      ) : (
        <Popover
          open={organizationPopoverOpen}
          onOpenChange={setOrganizationPopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 gap-1 text-xs"
            >
              <Users2Icon className="size-3" />
              Select Organization
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[300px] p-0"
            align="start"
            onInteractOutside={(e) => {
              e.preventDefault();
            }}
          >
            <Command>
              <CommandInput placeholder="Search organizations..." />
              <CommandList>
                {myOrganizations && myOrganizations.length > 0 ? (
                  <CommandGroup heading="Your Organizations">
                    {myOrganizations.map((org) => (
                      <CommandItem
                        key={org.id}
                        onSelect={() =>
                          onSelectOrg({ id: org.id, name: org.name })
                        }
                        style={{
                          backgroundColor: "transparent",
                        }}
                        className="flex items-center gap-2 mt-2 cursor-pointer hover:bg-[#eee]"
                      >
                        <Image
                          src={org.image || ""}
                          alt={org.name}
                          width={24}
                          height={24}
                          className="rounded-md ring-1 ring-sidebar-border group-hover:ring-sidebar-accent transition-all duration-200"
                        />
                        <span className="text-sm font-medium">{org.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : (
                  <CommandEmpty>
                    <p className="text-sm text-muted-foreground">
                      No organizations found.
                    </p>
                  </CommandEmpty>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default ChooseOrganization;
