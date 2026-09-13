import React, { useState, useEffect } from 'react';
import { Search, Terminal, Layers, Network, Binary, Eye, BarChart3, Database, FlaskConical, X } from 'lucide-react';
import { ActiveView } from '../../lib/types';
import { MODELS_REGISTRY } from '../../lib/store';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveView: (view: ActiveView) => void;
  onSelectModel: (modelId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  setActiveView,
  onSelectModel
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const labItems = [
    { id: 'playground', label: 'Launch AI Playground', category: 'Lab', icon: Terminal },
    { id: 'rag', label: 'Open RAG Laboratory & Failure Analysis', category: 'Lab', icon: Layers },
    { id: 'embeddings', label: 'Explore 2D/3D Embedding Space', category: 'Lab', icon: Network },
    { id: 'tokenization', label: 'Open Tokenization Lab (BPE Breakdown)', category: 'Lab', icon: Binary },
    { id: 'attention', label: 'View Transformer Attention Matrices', category: 'Lab', icon: Eye },
    { id: 'benchmarks', label: 'Run Model Benchmarks', category: 'Lab', icon: BarChart3 },
    { id: 'datasets', label: 'Dataset Explorer & Statistics', category: 'Lab', icon: Database },
    { id: 'experiments', label: 'View Research Experiments (EXP-00427)', category: 'Research', icon: FlaskConical },
  ];

  const filteredLabs = labItems.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredModels = MODELS_REGISTRY.filter(m => 
    m.name.toLowerCase().includes(query.toLowerCase()) || m.family.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
      <div className="w-full max-w-xl bg-[#111113] border border-[#27272A] rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search input */}
        <div className="flex items-center px-4 py-3 border-b border-[#27272A] gap-3">
          <Search className="w-4 h-4 text-cyan-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command, model, or lab module..."
            className="w-full bg-transparent text-sm text-[#FAFAFA] placeholder-[#71717A] focus:outline-none font-mono"
          />
          <button onClick={onClose} className="text-[#A1A1AA] hover:text-[#FAFAFA]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3 font-mono text-xs">
          {/* Lab Modules */}
          <div>
            <div className="px-2 py-1 text-[10px] uppercase font-semibold text-[#71717A]">
              Lab Modules
            </div>
            <div className="space-y-0.5">
              {filteredLabs.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id as ActiveView);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded hover:bg-[#18181B] text-[#FAFAFA] transition-colors group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] text-[#A1A1AA] border border-[#27272A] px-1.5 py-0.5 rounded">
                      Jump
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Models */}
          {filteredModels.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] uppercase font-semibold text-[#71717A]">
                Switch Active Model
              </div>
              <div className="space-y-0.5">
                {filteredModels.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectModel(m.id);
                      setActiveView('playground');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded hover:bg-[#18181B] text-[#FAFAFA] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-medium">{m.name}</span>
                      <span className="text-[#71717A]">({m.parameters})</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      {m.tokensPerSec} tok/s
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#09090B] border-t border-[#27272A] flex justify-between text-[11px] font-mono text-[#71717A]">
          <span>Use <b>↑ ↓</b> to navigate, <b>Enter</b> to select</span>
          <span><b>ESC</b> to close</span>
        </div>
      </div>
    </div>
  );
};
