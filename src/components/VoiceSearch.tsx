"use client";

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showError } from '@/utils/toast';
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
      log("[VoiceSearch] Speech recognition not supported in this browser.");
    }
  }, []);

  const startListening = () => {
    if (!isSupported) {
      showError("Voice search is not supported in this browser. Try Chrome or Safari.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      log("[VoiceSearch] Listening started...");
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
        showError(`Speech recognition failed: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      log("[VoiceSearch] Listening ended.");
    };

    try {
      recognition.start();
    } catch (err: any) {
      log(`[VoiceSearch] Start error: ${err.message}`, null, 'error');
      setIsListening(false);
    }
  };

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
              "rounded-full transition-all duration-300 relative overflow-hidden border-2",
              !isSupported ? "opacity-50 cursor-not-allowed border-slate-800 text-slate-600" : 
              isListening ? "bg-red-500/20 border-red-500 text-red-500" : "bg-indigo-500/10 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-400",
              className
            )}
          >
            {isListening && (
              <span className="absolute inset-0 bg-red-500/10 animate-ping pointer-events-none" />
            )}
            {!isSupported ? <MicOff className="w-4 h-4" /> : 
             isListening ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-slate-900 border-slate-800 text-white">
          {!isSupported ? "Voice search not supported in this browser" : 
           isListening ? "Listening..." : "Voice Search (e.g. 'Play me something about brain zones')"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VoiceSearch;