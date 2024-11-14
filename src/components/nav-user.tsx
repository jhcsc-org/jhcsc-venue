"use client"

import {
  ChevronsUpDown,
  LogOut
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useGetIdentity, useInvalidate, useLogout, useShow } from "@refinedev/core"
import { User } from "@supabase/supabase-js"
import { toast } from "sonner"

interface ProfileData {
  id: number;
  name: string | null;
  phone_number: string | null;
  affiliation: string | null;
  role: 'user' | 'manager' | 'admin';
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export function NavUser() {
  const { isMobile } = useSidebar()
  const { data: userData } = useGetIdentity<User>();
  const { query: { data, isLoading } } = useShow<ProfileData>({
    resource: "profiles",
    id: userData?.id,
    queryOptions: {
      enabled: !!userData,
    }
  });
  const invalidate = useInvalidate();
  const { mutate: logout } = useLogout();
  const handleLogout = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          logout();
          resolve(true);
        }, 1000);
      }), {
      loading: 'Logging out...',
      success: 'Logged out successfully',
      error: 'Failed to logout',
      finally: () => {
        invalidate({
          invalidates: ["all"]
        })
      }
    }
    );
  }
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <Avatar className="w-8 h-8 rounded-lg">
              <AvatarFallback className="bg-gray-200 rounded-lg animate-pulse" />
            </Avatar>
            <div className="grid flex-1 gap-1">
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="w-8 h-8 rounded-lg">
                <AvatarImage src="asd" alt="tasdsd" />
                <AvatarFallback className="rounded-lg">{
                  data?.data.name ? data?.data.name[0] : "VN"
                }
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-sm leading-tight text-left">
                <span className="font-semibold truncate">{data?.data.name}</span>
                <span className="text-xs truncate">{data?.data.affiliation}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="w-8 h-8 rounded-lg">
                  <AvatarImage src="asdasd" alt="asdasd" />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-sm leading-tight text-left">
                  <span className="font-semibold truncate">{data?.data.name}</span>
                  <span className="text-xs truncate">{data?.data.affiliation}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleLogout()}>
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}