import React from 'react';
import { 
  Cpu, 
  FlaskConical, 
  Database, 
  Activity, 
  CheckCircle2, 
  ArrowUpRight, 
  TrendingUp, 
  Zap, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { ActiveView, Experiment } from '../../lib/types';
import { MODELS_REGISTRY, PRELOADED_DATASETS } from '../../lib/store';

interface DashboardOverviewProps {
  setActiveView: (view: ActiveView) => void;
  experiments: Experiment[];
  onSelectExperiment: (exp: Experiment) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  setActiveView,
  experiments,
  onSelectExperiment
}) => {
  const totalCuratedRows = PRELOADED_DATASETS.reduce((acc, d) => acc + d.rowCount, 0);
  const experimentsWithFaith = experiments.filter(e => e.metrics.faithfulness !== undefined);
  const avgFaithPct = experimentsWithFaith.length > 0
    ? (experimentsWithFaith.reduce((acc, e) => acc + (e.metrics.faithfulness || 0), 0) / experimentsWithFaith.length * 100).toFixed(1)
    : '94.2';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-mono font-bold text-[#FAFAFA] tracking-wide">
              SYSTEM OVERVIEW
            </h1>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-400">
              CLUSTER: PRIMARY-01
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] font-sans mt-0.5">
            Real-time telemetry, model deployment statistics, and recent research experiments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveView('playground')}
            className="px-3.5 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 shadow-glow-cyan transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            Quick Run
          </button>
          <button
            onClick={() => setActiveView('experiments')}
            className="px-3.5 py-1.5 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-[#FAFAFA] transition-colors"
          >
            All Experiments
          </button>
        </div>
      </div>

      {/* Metric Counters (Section 5 Spec) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111113] border border-[#27272A] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs font-mono text-[#A1A1AA] mb-2">
            <span>ACTIVE MODELS</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-[#FAFAFA] tracking-tight">
            {MODELS_REGISTRY.length}
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            All weights initialized
          </div>
        </div>

        <div className="bg-[#111113] border border-[#27272A] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs font-mono text-[#A1A1AA] mb-2">
            <span>RESEARCH EXPERIMENTS</span>
            <FlaskConical className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-[#FAFAFA] tracking-tight">
            {experiments.length}
          </div>
          <div className="text-[11px] font-mono text-cyan-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Empirical logged data
          </div>
        </div>

        <div className="bg-[#111113] border border-[#27272A] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs font-mono text-[#A1A1AA] mb-2">
            <span>REGISTERED DATASETS</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-[#FAFAFA] tracking-tight">
            {PRELOADED_DATASETS.length}
          </div>
          <div className="text-[11px] font-mono text-[#A1A1AA] mt-2">
            {totalCuratedRows.toLocaleString()} curated rows
          </div>
        </div>

        <div className="bg-[#111113] border border-[#27272A] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs font-mono text-[#A1A1AA] mb-2">
            <span>AVG RAG FAITHFULNESS</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-emerald-400 tracking-tight">
            {avgFaithPct}%
          </div>
          <div className="text-[11px] font-mono text-emerald-400/80 mt-2">
            Across evaluated benchmarks
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Experiments & Quick Lab Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Experiments Table */}
        <div className="lg:col-span-8 bg-[#111113] border border-[#27272A] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4 border-b border-[#27272A] pb-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#FAFAFA]">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              <span>RECENT EXPERIMENTS LOG</span>
            </div>
            <button
              onClick={() => setActiveView('experiments')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              View Full Suite <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {experiments.slice(0, 5).map(exp => (
              <div
                key={exp.id}
                onClick={() => {
                  onSelectExperiment(exp);
                  setActiveView('experiments');
                }}
                className="p-3 rounded bg-[#18181B] border border-[#27272A] hover:border-cyan-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {exp.id}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#27272A] text-[#FAFAFA]">
                      {exp.taskType.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-[11px] text-[#71717A] font-mono">
                      {exp.createdAt}
                    </span>
                  </div>
                  <div className="text-xs text-[#FAFAFA] font-medium group-hover:text-cyan-300 transition-colors">
                    {exp.title}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                  {exp.metrics.faithfulness !== undefined && (
                    <div className="text-right">
                      <div className="text-[10px] text-[#A1A1AA]">FAITHFULNESS</div>
                      <div className="font-bold text-emerald-400">
                        {(exp.metrics.faithfulness * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                  <div className="text-right">
                    <div className="text-[10px] text-[#A1A1AA]">LATENCY</div>
                    <div className="text-[#FAFAFA] font-bold">
                      {exp.metrics.latencyMs} ms
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#A1A1AA]">THROUGHPUT</div>
                    <div className="text-cyan-400 font-bold">
                      {exp.metrics.tokensPerSec} tok/s
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Telemetry & Quick Action Benchmarks */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Model Stack */}
          <div className="bg-[#111113] border border-[#27272A] rounded-lg p-5">
            <div className="flex items-center justify-between mb-3 border-b border-[#27272A] pb-2 text-xs font-mono font-bold text-[#FAFAFA]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>HARDWARE UTILIZATION</span>
              </div>
              <span className="text-emerald-400">NORMAL</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#A1A1AA]">GPU Core Allocation</span>
                  <span className="text-[#FAFAFA]">68.4%</span>
                </div>
                <div className="h-1.5 bg-[#27272A] rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '68.4%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#A1A1AA]">High-Bandwidth VRAM</span>
                  <span className="text-[#FAFAFA]">18.4 / 24 GB</span>
                </div>
                <div className="h-1.5 bg-[#27272A] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '76.6%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#A1A1AA]">Vector Cache Hit Ratio</span>
                  <span className="text-[#FAFAFA]">98.2%</span>
                </div>
                <div className="h-1.5 bg-[#27272A] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '98.2%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Module Jump */}
          <div className="bg-[#111113] border border-[#27272A] rounded-lg p-5 font-mono text-xs">
            <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider mb-2 font-bold">
              LABORATORY SIGNATURES
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setActiveView('rag')}
                className="w-full text-left p-2.5 rounded bg-[#18181B] border border-cyan-500/30 hover:border-cyan-400 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-cyan-300">RAG Lab + Failure Analysis</div>
                  <div className="text-[10px] text-[#A1A1AA]">Inspect grounding, chunks & causes</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-cyan-400" />
              </button>

              <button
                onClick={() => setActiveView('attention')}
                className="w-full text-left p-2.5 rounded bg-[#18181B] border border-[#27272A] hover:border-cyan-500/50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-[#FAFAFA]">Transformer Attention Flow</div>
                  <div className="text-[10px] text-[#A1A1AA]">Multi-head heatmaps & dependency arcs</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#A1A1AA]" />
              </button>

              <button
                onClick={() => setActiveView('embeddings')}
                className="w-full text-left p-2.5 rounded bg-[#18181B] border border-[#27272A] hover:border-cyan-500/50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-[#FAFAFA]">3D Embedding Space</div>
                  <div className="text-[10px] text-[#A1A1AA]">PCA, t-SNE & UMAP vector projections</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#A1A1AA]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
