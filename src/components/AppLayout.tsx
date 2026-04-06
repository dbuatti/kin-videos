"use client";

import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlayCircle, 
  Library, 
  Zap, 
  Bookmark,
  Scissors,
  Terminal,
  Menu,
  RefreshCw,
  LogOut,
  BookOpen,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MadeWithDyad } from './made-with-dyad';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { showSuccess, showError } from '@/utils/toast';

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
  { label: 'Manual', icon: BookOpen, path: '/instructions' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) showError(error.message);
    else navigate('/login');
  };

  const handleSyncCourse = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const { error } = await supabase.functions.invoke('sync-course', {
        body: { user_id: user.id }
      });
      if (error) throw error;
      showSuccess("Course data synced!");
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const NavContent = () => (
    <div className="flex flex-col h-full py-8">
      <div className="px-8 mb-10">
        <div className="flex items-center space-x-3">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
            <Zap className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-white tracking-tighter text-xl">FNH ARCHIVER</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Main Menu</p>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center space-x-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group",
              location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                ? "bg-primary text-white shadow-xl shadow-primary/20"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className={cn("w-5 h-5", location.pathname === item.path ? "text-white" : "text-slate-500 group-hover:text-primary")} />
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="my-8 border-t border-white/5 mx-4" />
        
        <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Tools & Utils</p>
        {UTILITY_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center space-x-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group",
              location.pathname === item.path
                ? "bg-accent text-white shadow-xl shadow-accent/20"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className={cn("w-5 h-5", location.pathname === item.path ? "text-white" : "text-slate-500 group-hover:text-accent")} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="px-4 mt-auto space-y-3">
        <Button 
          onClick={handleSyncCourse} 
          disabled={isSyncing}
          variant="outline" 
          className="w-full justify-start rounded-2xl border-white/5 bg-white/5 text-slate-300 hover:bg-white/10 font-bold h-12"
        >
          <RefreshCw className={cn("w-4 h-4 mr-3", isSyncing && "animate-spin")} />
          {isSyncing ? "Syncing..." : "Sync Course"}
        </Button>
        <Button 
          onClick={handleLogout} 
          variant="ghost" 
          className="w-full justify-start rounded-2xl text-red-400 hover:bg-red-400/10 font-bold h-12"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </Button>
        <div className="pt-6">
          <MadeWithDyad />
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="h-20 bg-background/80 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-1.5 rounded-lg">
              <Zap className="text-white w-4 h-4" />
            </div>
            <span className="font-black text-white text-sm tracking-tighter">FNH ARCHIVER</span>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80 bg-background border-r-white/5">
              <NavContent />
            </SheetContent>
          </Sheet>
        </header>
        
        <main className="flex-1 pb-24">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-4 z-40 shadow-2xl">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center space-y-1.5 flex-1 h-full transition-all relative",
                location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                  ? "text-primary"
                  : "text-slate-500"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label.split(' ')[0]}</span>
              {(location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))) && (
                <div className="absolute bottom-0 w-10 h-1 bg-primary rounded-t-full shadow-[0_0_10px_rgba(0,210,255,0.5)]" />
              )}
            </Link>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-72 bg-background border-r border-white/5 sticky top-0 h-screen overflow-y-auto hidden lg:block">
        <NavContent />
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;