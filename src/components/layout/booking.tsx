import { CuboidIcon } from 'lucide-react';
import type { PropsWithChildren } from "react";

export const BookingLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex flex-col w-full min-h-screen space-y-2 bg-background">
      <header className="w-full p-4 space-y-6 border-b">
        <div className="container flex items-center justify-center mx-auto">
          <div className="flex items-center gap-2 mt-4">
            <CuboidIcon className="w-10 h-10 text-primary" />
            <h1 className='text-2xl font-semibold'>JHCSC Venue</h1>
          </div>
        </div>
      </header>
      <main className="container flex-grow pb-20 mx-auto">
        {children}
      </main>
    </div>
  );
};