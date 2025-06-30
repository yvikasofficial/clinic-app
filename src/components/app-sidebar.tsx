/* eslint-disable @next/next/no-img-element */
"use client";

import { Calendar, CreditCard, LayoutDashboard, Users } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    disabled: true,
    badge: "Coming Soon",
  },
  {
    title: "Appointment",
    url: "/appointment",
    icon: Calendar,
  },
  {
    title: "Patients",
    url: "/patients",
    icon: Users,
  },
  {
    title: "Payments",
    url: "/payments",
    icon: CreditCard,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="h-[64px] border-b rounded-none flex items-center justify-start px-4">
            <img src="/assets/global/logo.svg" alt="logo" className="h-8" />
          </SidebarGroupLabel>
          <SidebarGroupContent className="py-4 px-2">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild={!item.disabled}
                    tooltip={item.disabled ? item.badge : undefined}
                    className={
                      item.disabled ? "opacity-50 cursor-not-allowed" : ""
                    }
                  >
                    {item.disabled ? (
                      <div className="flex items-center">
                        <item.icon />
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="ml-auto text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    ) : (
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
