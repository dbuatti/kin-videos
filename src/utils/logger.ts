"use client";

// Simple in-memory log store for remote debugging
type LogEntry = {
  timestamp: string;
  level: 'info' | 'error' | 'warn';
  message: string;
  data?: any;
};

let logs: LogEntry[] = [];
const MAX_LOGS = 100;

export const log = (message: string, data?: any, level: LogEntry['level'] = 'info') => {
  const entry = {
    timestamp: new Date().toLocaleTimeString(),
    level,
    message,
    data
  };
  
  logs = [entry, ...logs].slice(0, MAX_LOGS);
  
  // Also output to real console
  const prefix = `[Playback]`;
  
  if (data !== undefined) {
    if (level === 'error') console.error(prefix, message, data);
    else if (level === 'warn') console.warn(prefix, message, data);
    else console.log(prefix, message, data);
  } else {
    if (level === 'error') console.error(prefix, message);
    else if (level === 'warn') console.warn(prefix, message);
    else console.log(prefix, message);
  }
  
  // Trigger a custom event so the Debug page can update
  window.dispatchEvent(new CustomEvent('app-log-updated'));
};

export const getLogs = () => logs;
export const clearLogs = () => {
  logs = [];
  window.dispatchEvent(new CustomEvent('app-log-updated'));
};