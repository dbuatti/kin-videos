"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { 
  LayoutDashboard, 
  Zap, 
  PlayCircle, 
  Library, 
  Scissors, 
  Terminal, 
  Bookmark, 
  BookOpen, 
  Settings
} from "lucide-react";

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/master-player"))}>
            <Zap className="mr-2 h-4 w-4" />
            <span>Master Player</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/gallery"))}>
            <PlayCircle className="mr-2 h-4 w-4" />
            <span>Video Gallery</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/library"))}>
            <Library className="mr-2 h-4 w-4" />
            <span>Inventory</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Tools">
          <CommandItem onSelect={() => runCommand(() => navigate("/stitcher"))}>
            <Scissors className="mr-2 h-4 w-4" />
            <span>Stitcher</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/scraper"))}>
            <Terminal className="mr-2 h-4 w-4" />
            <span>Scraper</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/bookmarks"))}>
            <Bookmark className="mr-2 h-4 w-4" />
            <span>Bookmarks</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/instructions"))}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>User Manual</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;