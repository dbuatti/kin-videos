"use client";

import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlayCircle, 
  Library, 
  Zap, 
  Menu,
  LogOut,
  Settings,
  Search,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MadeWithDyad } from './made-with-dyad';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import CommandPalette from './CommandPalette';

const NAV_ITEMS = [
  { label: 'Home', icon: LayoutDashboard, path: '/' },
  { label: 'Player', icon: Zap, path: '/master-player' },
  { label: 'Videos', icon: PlayCircle, path: '/gallery' },
  { label: 'Inventory', icon: Library, path: '/library' },
];

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<{ first_name?: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .maybeSingle();
      if (data) setProfile(data);
    };
    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const NavContent = () => (
    <div className="flex flex-col h-full py-8">
      <div className="px-8 mb-12">
        <div className="flex items-center space-x-3">
          <div className="bg-primary p-2 rounded-xl">
            <Zap className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-white tracking-tighter text-xl">FNH</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center space-x-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all group",
              location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
            {(location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))) && (
              <ChevronRight className="ml-auto w-4 h-4 opacity-50" />
            )}
          </Link>
        ))}
      </nav>

      <div className="px-4 mt-auto space-y-4">
        <Link 
          to="/settings" 
          onClick={() => setIsOpen(false)}
          className="flex items-center space-x-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-slate-800 text-primary text-xs font-black">
              {profile?.first_name?.[0] || user?.email?.[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">Settings</p>
          </div>
          <Settings className="w-4 h-4 text-slate-500" />
        </Link>

        <Button 
          onClick={handleLogout} 
          variant="ghost" 
          className="w-full justify-start rounded-2xl text-red-400 hover:bg-red-400/10 font-bold h-11 px-4"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </Button>
        
        <div className="pt-4 opacity-50">
          <MadeWithDyad />
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <CommandPalette />
        <header className="h-16 bg-background/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 sticky top-0 z-40">
          <div className="flex items-center space-x-2">
            <Zap className="text-primary w-5 h-5" />
            <span className="font-black text-white text-sm tracking-tighter">FNH</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-slate-400" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}>
              <Search className="w-5 h-5" />
            </Button>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 bg-background border-r-white/5">
                <NavContent />
              </SheetContent>
            </Sheet>
          </div>
        </header>
        <main className="flex-1 pb-20">
          <Outlet />
        </main>
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 z-40">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link key={item.path} to={item.path} className={cn("flex flex-col items-center space-y-1", isActive ? "text-primary" : "text-slate-500")}>
                <item.icon className="w-5 h-5" />
                <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <CommandPalette />
      <aside className="w-64 bg-background border-r border-white/5 sticky top-0 h-screen hidden lg:block">
        <NavContent />
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 pt-8 flex justify-end">
          <Button 
            variant="outline" 
            className="bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 rounded-xl h-10 px-4 font-bold text-xs"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          >
            <Search className="w-4 h-4 mr-2" />
            Search...
            <kbd className="ml-4 bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono">⌘K</kbd>
          </Button>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;