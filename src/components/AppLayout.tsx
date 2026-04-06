"use client";

import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlayCircle, 
  Library, 
  Zap, 
  Settings, 
  Bookmark,
  Scissors,
  Terminal,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MadeWithDyad } from './made-with-dyad';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Master Player', icon: Zap, path: '/master-player' },
  { label: 'Video Gallery', icon: PlayCircle, path: '/gallery' },
  { label: 'Inventory', icon: Library, path: '/library' },
];

const UTILITY_ITEMS = [
  { label: 'Stitcher', icon: Scissors, path: '/stitcher' },
  { label: 'Scraper', icon: Terminal, path: '/scraper' },
  { label: 'Bookmarks', icon: Bookmark, path: '/bookmarks' },
];

const AppLayout = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);

  const NavContent = ({ className }: { className?: string }) => (
    <div className={cn("flex flex-col h-full py-6", className)}>
      <div className="px-6 mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
            <Zap className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-indigo-900 tracking-tight text-lg">FNH Archiver</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Main Menu</p>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group",
              location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
            )}
          >
            <item.icon className={cn("w-5 h-5", location.pathname === item.path ? "text-white" : "text-gray-400 group-hover:text-indigo-500")} />
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="my-6 border-t border-gray-100 mx-3" />
        
        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tools & Utils</p>
        {UTILITY_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group",
              location.pathname === item.path
                ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                : "text-gray-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon className={cn("w-5 h-5", location.pathname === item.path ? "text-white" : "text-gray-400 group-hover:text-slate-600")} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="px-6 mt-auto">
        <MadeWithDyad />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-indigo-100 flex items-center justify-between px-4 sticky top-0 z-40">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-1 rounded-md">
              <Zap className="text-white w-4 h-4" />
            </div>
            <span className="font-black text-indigo-900 text-sm">FNH ARCHIVER</span>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-indigo-600">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-r-indigo-100">
              <NavContent />
            </SheetContent>
          </Sheet>
        </header>
        
        <main className="flex-1 pb-20">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-indigo-100 flex items-center justify-around px-2 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 flex-1 h-full transition-all",
                location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                  ? "text-indigo-600"
                  : "text-gray-400"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
              {location.pathname === item.path && (
                <div className="absolute bottom-0 w-8 h-1 bg-indigo-600 rounded-t-full" />
              )}
            </Link>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-indigo-100 sticky top-0 h-screen overflow-y-auto hidden lg:block">
        <NavContent />
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;