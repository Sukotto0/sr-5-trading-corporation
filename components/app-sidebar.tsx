"use client";

import * as React from "react";
import {
  BoxesIcon,
  ChartBarIcon,
  GalleryVerticalEnd,
  MessageSquare,
  SquareTerminal,
  TimerIcon,
  UserCog2,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    imageUrl: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navSuperAdmin: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: SquareTerminal,
    },
    {
      title: "Inventory",
      url: "/admin/inventory",
      icon: BoxesIcon,
    },
    {
      title: "Sales",
      url: "/admin/sales",
      icon: ChartBarIcon,
    },
    {
      title: "Schedules",
      url: "/admin/scheduled-visit",
      icon: TimerIcon,
    },
    {
      title: "Feedback Records",
      icon: MessageSquare,
      url: "/admin/feedback",
    },
    {
      title: "Users",
      url: "#",
      icon: UserCog2,
      items: [
        {
          title: "User Management",
          url: "/admin/users/user-management",
        },
        {
          title: "Admin Management",
          url: "/admin/users/admin-management",
        },
      ],
    },
  ],
  navAdmin: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: SquareTerminal,
    },
    {
      title: "Inventory",
      url: "/admin/inventory",
      icon: BoxesIcon,
    },
    {
      title: "Sales",
      url: "/admin/sales",
      icon: ChartBarIcon,
    },
    {
      title: "Schedules",
      url: "/admin/scheduled-visit",
      icon: TimerIcon,
    },
    {
      title: "Feedback Records",
      icon: MessageSquare,
      url: "/admin/feedback",
    },
    {
      title: "Users",
      url: "/admin/users/user-management",
      icon: UserCog2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  console.log("Current User:", user?.publicMetadata);

  const userData = {
    name: user?.username || "User",
    email: user?.emailAddresses[0]?.emailAddress || "user@example.com",
    imageUrl: user?.imageUrl || "/avatars/default.png",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex flex-row items-center flex-nowrap gap-3">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
            <Image
              src="/images/SR5MoreMinimal.png"
              width={80}
              height={80}
              alt="SR-5 Trading Corporation Logo"
              className="rounded-lg"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight mt-1">
            <span className="truncate font-semibold">
              SR-5 Trading Corporation
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {user?.publicMetadata.adminRole === "superadmin" ? (
          <NavMain items={data.navSuperAdmin} />
        ) : (
          <NavMain items={data.navAdmin} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
