"use client";

import React from 'react';
import { usePlaybackSpeed } from '@/hooks/use-playback-speed';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

const SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

interface PlaybackSpeedControlProps {
  className?: string;
  variant?: 'outline' | 'ghost' | 'default';
}

const PlaybackSpeedControl: React.FC<PlaybackSpeedControlProps> = ({ className, variant = 'outline' }) => {
  const { speed, setSpeed } = usePlaybackSpeed();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size="sm" 
          className={cn("rounded-xl border-indigo-100 text-indigo-600 h-8 px-3", className)}
        >
          <Gauge className="w-4 h-4 mr-2" />
          <span className="font-bold">{speed}x</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl border-indigo-100">
        {SPEEDS.map((s) => (
          <DropdownMenuItem 
            key={s} 
            onClick={() => setSpeed(s)}
            className={cn(
              "cursor-pointer font-medium",
              speed === s ? "bg-indigo-50 text-indigo-600" : "text-gray-600"
            )}
          >
            {s}x
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PlaybackSpeedControl;