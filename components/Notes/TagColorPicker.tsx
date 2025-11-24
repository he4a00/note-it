"use client";

import { HexColorPicker } from "react-colorful";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface TagColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const TagColorPicker = ({ color, onChange }: TagColorPickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-8 w-8 p-0 border-2"
          style={{ backgroundColor: color }}
          aria-label="Pick color"
        >
          <span className="sr-only">Pick color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <HexColorPicker color={color} onChange={onChange} />
        <div className="mt-2 flex items-center gap-2">
          <div
            className="h-6 w-6 rounded border-2"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs font-mono">{color}</span>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TagColorPicker;
