import React from 'react';
import { 
  LayoutDashboard, 
  Terminal, 
  Layers, 
  Network, 
  Binary, 
  Eye, 
  BarChart3, 
  Database,
  FlaskConical,
  CheckCircle2,
  GitCompare,
  FileText,
  Cpu,
  Code2,
  BookOpen
} from 'lucide-react';
import { ActiveView } from '../../lib/types';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const labNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'playground', label: 'AI Playground', icon: Terminal },
    { id: 'rag', label: 'RAG Laboratory', icon: Layers, highlight: true },
    { id: 'embeddings', label: 'Embeddings', icon: Network },
    { id: 'tokenization', label: 'Tokenization', icon: Binary },
    { id: 'attention', label: 'Attention', icon: Eye },
    { id: 'benchmarks', label: 'Model Benchmarks', icon: BarChart3 },
    { id: 'datasets', label: 'Dataset Explorer', icon: Database },
  ];

  const researchNav = [
    { id: 'experiments', label: 'Experiments', icon: FlaskConical },
    { id: 'evaluations', label: 'Evaluations', icon: CheckCircle2 },
    { id: 'comparisons', label: 'Comparisons', icon: GitCompare },
    { id: 'papers', label: 'Research Papers', icon: FileText },
  ];

  const systemNav = [
    { id: 'models', label: 'Models', icon: Cpu },
    { id: 'datasets', label: 'Datasets', icon: Database },
    { id: 'api', label: 'API', icon: Code2 },
    { id: 'docs', label: 'Documentation', icon: BookOpen },
  ];

  const renderNavSection = (title: string, items: typeof labNav) => (
    <div className="mb-5">
      <div className="px-3 mb-1.5 text-[10px] font-mono font-semibold tracking-wider text-[#A1A1AA] uppercase">
        {title}
      </div>
      <nav className="space-y-0.5">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ActiveView)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-xs font-mono transition-all group ${
                isActive
                  ? 'bg-cyan-950/40 text-cyan-300 border-l-2 border-cyan-400 font-medium'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-[#A1A1AA] group-hover:text-cyan-400'} transition-colors`} />
                <span>{item.label}</span>
              </div>
              {item.highlight && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <aside className="w-56 border-r border-[#27272A] bg-[#111113] flex flex-col justify-between p-3 shrink-0 select-none">
      <div className="overflow-y-auto">
        {renderNavSection('LAB', labNav)}
        {renderNavSection('RESEARCH', researchNav)}
        {renderNavSection('SYSTEM', systemNav)}
      </div>

      {/* Sidebar Footer telemetry */}
      <div className="pt-3 border-t border-[#27272A] px-2 text-[11px] font-mono text-[#A1A1AA]">
        <div className="flex justify-between items-center mb-1">
          <span>HOST:</span>
          <span className="text-[#FAFAFA]">127.0.0.1:5173</span>
        </div>
        <div className="flex justify-between items-center">
          <span>ENV:</span>
          <span className="text-cyan-400 font-semibold">DEV / RESEARCH</span>
        </div>
      </div>
    </aside>
  );
};
