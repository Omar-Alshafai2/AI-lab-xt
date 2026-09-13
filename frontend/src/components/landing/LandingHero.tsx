import React, { useRef, useEffect, useState } from 'react';
import { 
  Terminal, 
  Layers, 
  Network, 
  BarChart3, 
  ArrowRight, 
  Activity, 
  Cpu, 
  Database,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ActiveView } from '../../lib/types';
import { MODELS_REGISTRY } from '../../lib/store';

interface LandingHeroProps {
  setActiveView: (view: ActiveView) => void;
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  setActiveView,
  selectedModelId,
  setSelectedModelId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeModelIdx, setActiveModelIdx] = useState(0);

  // Cycle through models or pick one
  const currentModel = MODELS_REGISTRY[activeModelIdx];

  // Interactive Neural / Particle Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes
    const nodeCount = Math.min(85, Math.floor((width * height) / 10000));
    const nodes: { x: number; y: number; vx: number; vy: number; radius: number; color: string }[] = [];

    const colors = ['#06B6D4', '#22D3EE', '#38BDF8', '#10B981', '#71717A'];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2.5 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Mouse coordinates
    let mouse = { x: -1000, y: -1000, radius: 120 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.25;
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw & update nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Mouse repulsion & interaction
        const mdx = node.x - mouse.x;
        const mdy = node.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mdist < mouse.radius) {
          const force = (1 - mdist / mouse.radius) * 3;
          node.vx += (mdx / mdist) * force * 0.2;
          node.vy += (mdy / mdist) * force * 0.2;
        }

        node.x += node.vx;
        node.y += node.vy;

        // Friction
        node.vx *= 0.98;
        node.vy *= 0.98;

        // Bounce from walls
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Render point
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex flex-col justify-between overflow-hidden bg-[#09090B]">
      {/* Background Interactive Neural Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto z-0 opacity-70"
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-lab-grid opacity-30 pointer-events-none z-0"></div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-8 w-full">
        {/* Terminal Header tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#111113] border border-[#27272A] text-xs font-mono text-[#A1A1AA] mb-8">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-[#FAFAFA] font-semibold">CORTEXLAB</span>
          <span className="text-[#71717A]">|</span>
          <span>INTERACTIVE RESEARCH SUITE V1.0</span>
        </div>

        {/* Main Headline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#FAFAFA] uppercase font-mono leading-[1.05]">
              UNDERSTAND <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-100">
                THE MACHINES
              </span> <br />
              BEHIND AI.
            </h1>

            <p className="text-lg text-[#A1A1AA] max-w-xl font-sans font-light leading-relaxed">
              Interactive experimentation for modern machine learning systems.
              Evaluate RAG pipelines with failure diagnostics, inspect attention heads, project high-dimensional embeddings, and benchmark models.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => setActiveView('overview')}
                className="px-6 py-3 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-sm flex items-center gap-2 shadow-glow-cyan transition-all hover:translate-y-[-1px]"
              >
                Launch Laboratory
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveView('papers')}
                className="px-6 py-3 rounded bg-[#111113] hover:bg-[#18181B] text-[#FAFAFA] border border-[#27272A] hover:border-cyan-500/50 font-mono text-sm transition-all"
              >
                Explore Research
              </button>
            </div>
          </div>

          {/* Right: Section 4 Live System HUD */}
          <div className="lg:col-span-5">
            <div className="bg-[#111113]/95 border border-[#27272A] rounded-lg p-5 font-mono shadow-panel backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3 mb-4">
                <div className="flex items-center gap-2 text-xs text-[#FAFAFA] font-bold">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>LIVE SYSTEM TELEMETRY</span>
                </div>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span className="w-2 h-2 rounded-full bg-[#3F3F46]"></span>
                </div>
              </div>

              {/* Model selection ticker */}
              <div className="mb-4">
                <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider mb-1">
                  ACTIVE BENCHMARK MODEL
                </div>
                <div className="flex items-center justify-between bg-[#18181B] p-2.5 rounded border border-[#27272A]">
                  <div>
                    <span className="text-cyan-400 font-bold text-sm block">
                      {currentModel.name}
                    </span>
                    <span className="text-[11px] text-[#71717A]">
                      {currentModel.family} • {currentModel.parameters}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveModelIdx((activeModelIdx + 1) % MODELS_REGISTRY.length)}
                    className="text-xs text-[#A1A1AA] hover:text-cyan-300 border border-[#27272A] px-2 py-1 rounded hover:bg-[#27272A] transition-colors"
                  >
                    Switch ▼
                  </button>
                </div>
              </div>

              {/* Monospace telemetry grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#18181B] p-3 rounded border border-[#27272A]">
                  <div className="text-[10px] text-[#A1A1AA] uppercase mb-1">TOKENS EVALUATED</div>
                  <div className="text-lg font-bold text-[#FAFAFA] tabular-nums">1,284</div>
                </div>

                <div className="bg-[#18181B] p-3 rounded border border-[#27272A]">
                  <div className="text-[10px] text-[#A1A1AA] uppercase mb-1">LATENCY</div>
                  <div className="text-lg font-bold text-cyan-400 tabular-nums">
                    {currentModel.latencyMs} ms
                  </div>
                </div>

                <div className="bg-[#18181B] p-3 rounded border border-[#27272A]">
                  <div className="text-[10px] text-[#A1A1AA] uppercase mb-1">TOKENS / SEC</div>
                  <div className="text-lg font-bold text-emerald-400 tabular-nums">
                    {currentModel.tokensPerSec}
                  </div>
                </div>

                <div className="bg-[#18181B] p-3 rounded border border-[#27272A]">
                  <div className="text-[10px] text-[#A1A1AA] uppercase mb-1">CONTEXT WINDOW</div>
                  <div className="text-lg font-bold text-[#FAFAFA] tabular-nums">
                    {currentModel.contextWindow.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Telemetry status bar */}
              <div className="text-[11px] text-[#A1A1AA] flex items-center justify-between pt-2 border-t border-[#27272A]">
                <span>STATUS: <span className="text-emerald-400 font-semibold">OPTIMAL</span></span>
                <span>FAILURES: <span className="text-[#FAFAFA]">0 / 124</span></span>
                <span>GROUNDING: <span className="text-cyan-400 font-semibold">94.2%</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          <button
            onClick={() => setActiveView('playground')}
            className="p-4 rounded-lg bg-[#111113]/80 border border-[#27272A] hover:border-cyan-500/50 hover:bg-[#18181B] text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-cyan-400 transition-colors" />
            </div>
            <div className="font-mono text-sm font-bold text-[#FAFAFA] mb-1">AI PLAYGROUND</div>
            <p className="text-xs text-[#A1A1AA]">
              Inference telemetry, token economics, latency, and temperature sampling.
            </p>
          </button>

          <button
            onClick={() => setActiveView('rag')}
            className="p-4 rounded-lg bg-[#111113]/80 border border-cyan-500/30 hover:border-cyan-400 hover:bg-[#18181B] text-left transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[9px] font-mono border-b border-l border-cyan-500/30">
              SIGNATURE
            </div>
            <div className="flex items-center justify-between mb-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-cyan-400 transition-colors" />
            </div>
            <div className="font-mono text-sm font-bold text-[#FAFAFA] mb-1">RAG LABORATORY</div>
            <p className="text-xs text-[#A1A1AA]">
              Full pipeline visualization, grounding metrics, and automated failure analysis.
            </p>
          </button>

          <button
            onClick={() => setActiveView('embeddings')}
            className="p-4 rounded-lg bg-[#111113]/80 border border-[#27272A] hover:border-cyan-500/50 hover:bg-[#18181B] text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <Network className="w-5 h-5 text-cyan-400" />
              <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-cyan-400 transition-colors" />
            </div>
            <div className="font-mono text-sm font-bold text-[#FAFAFA] mb-1">EMBEDDINGS LAB</div>
            <p className="text-xs text-[#A1A1AA]">
              Interactive 2D & 3D semantic vector space with PCA, t-SNE, and UMAP projections.
            </p>
          </button>

          <button
            onClick={() => setActiveView('attention')}
            className="p-4 rounded-lg bg-[#111113]/80 border border-[#27272A] hover:border-cyan-500/50 hover:bg-[#18181B] text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-cyan-400 transition-colors" />
            </div>
            <div className="font-mono text-sm font-bold text-[#FAFAFA] mb-1">ATTENTION & BENCHMARKS</div>
            <p className="text-xs text-[#A1A1AA]">
              Transformer attention heatmaps, multi-head arcs, and model latency leaderboards.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
