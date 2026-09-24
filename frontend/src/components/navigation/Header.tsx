import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  ExternalLink, 
  Terminal, 
  Cpu, 
  Database,
  PanelLeftOpen,
  PanelLeftClose
} from 'lucide-react';
import { ActiveView } from '../../lib/types';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  openCommandPalette: () => void;
  selectedModelName: string;
  selectedModelVram?: number;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  openCommandPalette,
  selectedModelName,
  selectedModelVram,
  sidebarOpen = true,
  onToggleSidebar,
}) => {
  const [latency, setLatency] = useState<number | null>(null);
  const [memoryUsage, setMemoryUsage] = useState<string>('Allocating...');

  useEffect(() => {
    let mounted = true;
    const measureLatency = async () => {
      const t0 = performance.now();
      try {
        await fetch(window.location.origin + '/vite.svg', { method: 'HEAD', cache: 'no-store' });
        const delta = Math.round(performance.now() - t0);
        if (mounted) setLatency(delta);
      } catch {
        const delta = Math.max(2, Math.round(performance.now() - t0));
        if (mounted) setLatency(delta);
      }
    };
    measureLatency();
    const interval = setInterval(measureLatency, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.performance as any)?.memory) {
      const mem = (window.performance as any).memory;
      const mb = Math.round(mem.usedJSHeapSize / (1024 * 1024));
      setMemoryUsage(`${mb} MB Heap`);
    } else if (selectedModelVram && selectedModelVram > 0) {
      setMemoryUsage(`${(selectedModelVram / 1024).toFixed(1)} GB`);
    } else {
      setMemoryUsage('Serverless');
    }
  }, [selectedModelVram]);

  return (
    <header className="h-14 border-b border-[#27272A] bg-[#111113]/90 backdrop-blur-md sticky top-0 z-40 px-4 flex items-center justify-between">
      {/* Left: Sidebar Toggle + Brand & Telemetry Status */}
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle Button */}
        {activeView !== 'landing' && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B] border border-transparent hover:border-[#27272A] transition-colors"
            title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {sidebarOpen
              ? <PanelLeftClose className="w-4 h-4" />
              : <PanelLeftOpen className="w-4 h-4" />}
          </button>
        )}
        <div className="flex items-center gap-6">
        <button 
          onClick={() => setActiveView('landing')}
          className="flex items-center gap-2 text-left group focus:outline-none"
        >
          <div className="w-7 h-7 rounded bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-bold tracking-wider text-sm text-[#FAFAFA] flex items-center gap-1.5">
              AI LAB XT
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block animate-pulse"></span>
            </span>
            <span className="text-[10px] font-mono text-[#A1A1AA] -mt-0.5">RESEARCH SUITE</span>
          </div>
        </button>

        {/* Live System Telemetry Badges */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono border-l border-[#27272A] pl-5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>SYSTEM ONLINE</span>
          </div>

          <div className="flex items-center gap-1 text-[#A1A1AA]">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>LATENCY:</span>
            <span className="text-cyan-300 font-semibold">{latency !== null ? `${latency} ms` : 'Measuring...'}</span>
          </div>

          <div className="flex items-center gap-1 text-[#A1A1AA]">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>MEM:</span>
            <span className="text-[#FAFAFA] font-medium">{memoryUsage}</span>
          </div>

          <div className="flex items-center gap-1 text-[#A1A1AA]">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>DB:</span>
            <span className={isSupabaseConfigured ? 'text-emerald-400' : 'text-zinc-400'}>
              {isSupabaseConfigured ? 'SUPABASE' : 'LOCAL CACHE'}
            </span>
          </div>
        </div>
        </div>
      </div>

      {/* Right: Quick Command Search, Docs, GitHub, User Profile */}
      <div className="flex items-center gap-3">
        {/* Command Palette Trigger */}
        <button
          onClick={openCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#18181B] border border-[#27272A] hover:border-cyan-500/50 text-[#A1A1AA] hover:text-[#FAFAFA] text-xs font-mono transition-all group"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Search commands, models...</span>
          <span className="sm:hidden">Search</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.2 text-[10px] bg-[#27272A] rounded text-[#FAFAFA] border border-[#3F3F46]">
            Ctrl K
          </kbd>
        </button>

        {/* Active Model Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18181B] border border-[#27272A] text-xs font-mono text-[#FAFAFA]">
          <span className="text-[#A1A1AA]">MODEL:</span>
          <span className="text-cyan-400 font-medium truncate max-w-[130px]">{selectedModelName}</span>
        </div>

        {/* GitHub External */}
        <a
          href="https://github.com/Omar-Alshafai2/cortexlab"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B] border border-transparent hover:border-[#27272A] transition-colors"
          title="GitHub Repository"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};
