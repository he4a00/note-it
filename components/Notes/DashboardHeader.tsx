"use client";

import React from "react";
import CreateNoteModel from "./CreateNoteModel";
import { ThemeToggle } from "../shared/ThemeToggle";

const DashboardHeader = () => {
  return (
    <div className="flex items-center gap-2 justify-end w-full container mx-auto">
      <CreateNoteModel />
      <ThemeToggle />
    </div>
  );
};

export default DashboardHeader;
