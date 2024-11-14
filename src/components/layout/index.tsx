import { useState } from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ProfileShow } from '@/pages/users/profiles'
import { AppSidebar } from '../app-sidebar'
import { SidebarProvider } from '../ui/sidebar'

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  return (
    <div className='w-full'>
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Settings</DialogTitle>
          </DialogHeader>
          <ProfileShow />
        </DialogContent>
      </Dialog>
    </div>
  )
}