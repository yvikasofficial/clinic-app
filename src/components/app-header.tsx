"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "./ui/sidebar";

interface AppHeaderProps {
  userName?: string;
  userPosition?: string;
  userInitials?: string;
}

export function AppHeader({
  userName = "Amy Smith",
  userPosition = "Head of Staff",
  userInitials = "AS",
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4">
      {/* Left side - Search */}
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <SidebarTrigger />
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients, appointments..."
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Right side - Notifications and Profile */}
      <div className="flex items-center gap-3">
        {/* Bell Icon */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {/* Notification badge */}
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center">
            3
          </span>
        </Button>

        {/* Profile Section */}
        <div className="flex items-center gap-3 pl-3 border-l">
          {/* Profile Avatar */}
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
            {userInitials}
          </div>

          {/* User Info */}
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">{userName}</span>
            <span className="text-xs text-muted-foreground leading-none mt-1">
              {userPosition}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
