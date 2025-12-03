import { ArrowUpRightIcon, Folder } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import NewDropDown from "../Notes/NewDropDown";

interface EmptyComponentProps {
  title: string;
  description: string;
  ButtonText: string;
}

export function EmptyComponent({
  title,
  description,
  ButtonText,
}: EmptyComponentProps) {
  return (
    <Empty className="py-12 px-4 max-w-md mx-auto">
      <EmptyHeader className="flex flex-col items-center gap-4">
        <EmptyMedia
          variant="icon"
          className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-2"
        >
          <Folder className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
        </EmptyMedia>
        <div className="space-y-2 text-center">
          <EmptyTitle className="font-serif text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
          </EmptyTitle>
          <EmptyDescription className="text-base text-muted-foreground max-w-xs mx-auto leading-relaxed">
            {description}
          </EmptyDescription>
        </div>
      </EmptyHeader>
      <EmptyContent className="mt-8">
        <div className="flex flex-col items-center gap-4">
          <NewDropDown text={ButtonText} />
          <Button
            variant="link"
            asChild
            className="text-muted-foreground hover:text-foreground transition-colors"
            size="sm"
          >
            <a href="#" className="flex items-center gap-1">
              Learn More <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}

interface EntityPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export const EntityPagination = ({
  page,
  totalPages,
  onPageChange,
  disabled,
}: EntityPaginationProps) => {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page === 1}
      >
        Previous
      </Button>
      <span className="text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page === totalPages}
      >
        Next
      </Button>
    </div>
  );
};
