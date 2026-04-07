"use client";

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { log } from '@/utils/logger';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VoiceSearchProps {
  onResult: (text: string) => void;
  className?: string;
}

const VoiceSearch: React.FC<VoiceSearchProps> = ({ onResult, className }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      log(`[VoiceSearch] Heard: "${text}"`);
      onResult(text);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        showError("Microphone access denied.");
      } else {
        showError("Speech recognition failed.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (!isSupported) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={startListening}
            disabled={isListening}
            className={cn(
              "rounded-full transition-all duration-300 relative overflow-hidden",
              isListening ? "bg-red-500/20 border-red-500 text-red-500" : "bg-slate-900 border-slate-700 text-indigo-400 hover:bg-slate-800",
              className
            )}
          >
            {isListening && (
              <span className="absolute inset-0 bg-red-500/10 animate-ping pointer-events-none" />
            )}
            {isListening ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-slate-900 border-slate-800 text-white">
          {isListening ? "Listening..." : "Voice Search (e.g. 'Play me something about brain zones')"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VoiceSearch;