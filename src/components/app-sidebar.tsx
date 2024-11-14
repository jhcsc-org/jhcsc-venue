import {
  Bell,
  Building,
  CalendarCheck2,
  LifeBuoy,
  Logs,
  MapPin,
  Send,
  Settings,
  X
} from "lucide-react"
import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavLink } from "react-router-dom"

const data = {
  navMain: [
    {
      title: "Updates",
      url: "/updates",
      icon: Bell,
      isActive: true,
    },
    {
      title: "Venues",
      url: "/venues/list",
      icon: Building,
      isActive: true,
    },
    {
      title: "Bookings",
      url: "/booked/all",
      icon: CalendarCheck2,
      isActive: true,
      items: [{
        title: "Pending",
        url: "/booked/all",
        icon: Send,
      },
      {
        title: "Approved",
        url: "/approved",
        icon: CalendarCheck2,
      },
      {
        title: "Declined",
        url: "/declined",
        icon: X,
      }
      ]
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Logs",
      url: "/logs",
      icon: Logs,
      isActive: true,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/venues/list">
                <div className="flex items-center justify-center rounded-lg aspect-square size-8 bg-sidebar-primary text-sidebar-primary-foreground">
                  <MapPin className="size-4" />
                </div>
                <div className="grid flex-1 text-sm leading-tight text-left">
                  <span className="font-semibold truncate">Venue Booking System</span>
                  <span className="text-xs truncate">J.H. Cerilles State College</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
