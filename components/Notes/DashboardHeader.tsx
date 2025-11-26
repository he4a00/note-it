"use client";

import React from "react";
import { ThemeToggle } from "../shared/ThemeToggle";
import NewDropDown from "./NewDropDown";

const DashboardHeader = () => {
  return (
    <div className="flex items-center gap-2 justify-end w-full container mx-auto">
      <NewDropDown />
      <ThemeToggle />
    </div>
  );
};

export default DashboardHeader;
