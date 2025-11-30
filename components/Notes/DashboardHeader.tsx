"use client";

import React from "react";
import { ThemeToggle } from "../shared/ThemeToggle";
import NewDropDown from "./NewDropDown";
import NotificationsList from "../shared/notifications-list";

const DashboardHeader = () => {
  return (
    <div className="flex items-center gap-2 justify-end w-full container mx-auto">
      <NotificationsList />
      <NewDropDown />
      <ThemeToggle />
    </div>
  );
};

export default DashboardHeader;
