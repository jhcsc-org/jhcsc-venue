import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { useBreadcrumb } from "@refinedev/core"
import { ChevronRight } from "lucide-react"
import React from "react"

export default function Page({
  children
}: {
  children: React.ReactNode
}) {
  const { breadcrumbs } = useBreadcrumb();
  const MAX_ITEMS = 3;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex items-center h-16 gap-2 p-6 shrink-0">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="size-5" />
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.length > MAX_ITEMS ? (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink href={breadcrumbs[0].href}>
                        {breadcrumbs[0].label}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>
                      <ChevronRight className="w-4 h-4" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1">
                          <BreadcrumbEllipsis />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {breadcrumbs.slice(1, -1).map((item) => (
                            <DropdownMenuItem key={item.label}>
                              <BreadcrumbLink href={item.href}>
                                {item.label}
                              </BreadcrumbLink>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>
                      <ChevronRight className="w-4 h-4" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {breadcrumbs[breadcrumbs.length - 1].label}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                ) : (
                  breadcrumbs.map((item, index) => (
                    <React.Fragment key={item.label}>
                      <BreadcrumbItem>
                        {item.href ? (
                          <BreadcrumbLink href={item.href}>
                            {item.label}
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>
                            {item.label}
                          </BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator>
                          <ChevronRight className="w-4 h-4" />
                        </BreadcrumbSeparator>
                      )}
                    </React.Fragment>
                  ))
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className='min-h-[100vh] flex-1 rounded-xl bg-background md:min-h-min px-6 pb-8'>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}