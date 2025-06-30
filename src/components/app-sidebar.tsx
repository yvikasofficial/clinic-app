/* eslint-disable @next/next/no-img-element */
"use client";

import { Calendar, CreditCard, LayoutDashboard, Users } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import Link from "next/link";

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
    title: "Appointments",
    url: "/appointments",
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
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="h-[64px] border-b rounded-none flex items-center justify-start px-4">
            <img src="/assets/global/logo.svg" alt="logo" className="h-8" />
          </SidebarGroupLabel>
          <SidebarGroupContent className="py-4 px-2">
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild={!item.disabled}
                      isActive={isActive && !item.disabled}
                      tooltip={item.disabled ? item.badge : undefined}
                      className={
                        item.disabled ? "opacity-50 cursor-not-allowed" : ""
                      }
                    >
                      {item.disabled ? (
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                          )}
                        </div>
                      ) : (
                        <Link href={item.url} className="flex items-center">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
