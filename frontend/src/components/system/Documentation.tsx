import React from 'react';
import { BookOpen, Terminal, Database, Cpu, Layers, Sparkles } from 'lucide-react';

export const Documentation: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full font-mono text-xs">
      {/* Header */}
      <div className="border-b border-[#27272A] pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[#FAFAFA] tracking-wide">
            CORTEXLAB ARCHITECTURAL DOCUMENTATION
          </h1>
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-400">
            SYSTEM MANUAL
          </span>
        </div>
        <p className="text-xs text-[#A1A1AA] font-sans mt-0.5">
          Engineering guidelines, local model inference setup, and Supabase pgvector configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Guides */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Overview */}
          <div className="bg-[#111113] border border-[#27272A] rounded-lg p-5 space-y-3">
            <h2 className="text-sm font-bold text-[#FAFAFA] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              1. Architecture & Design Philosophy
            </h2>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              CortexLab is engineered as professional research software combining the density and responsiveness of Bloomberg analytics with modern developer tooling. It dispenses with generic SaaS animations and purple gradients in favor of high-precision scientific telemetry, monospace metrics, and interactive visualization of internal model representations.
            </p>
          </div>

          {/* Section 2: Local LLM Inference */}
          <div className="bg-[#111113] border border-[#27272A] rounded-lg p-5 space-y-3">
            <h2 className="text-sm font-bold text-[#FAFAFA] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              2. Local LLM Inference via Ollama / llama.cpp
            </h2>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              For local zero-cost inference, CortexLab integrates natively with Ollama. Run:
            </p>
            <pre className="bg-[#09090B] p-3 rounded border border-[#27272A] text-cyan-300">
              ollama run llama3.1:8b-instruct-q4_K_M
            </pre>
            <p className="text-[11px] text-[#A1A1AA]">
              FastAPI routes in <code className="text-cyan-300">backend/app/api/routes/inference.py</code> forward requests to <code className="text-[#FAFAFA]">http://localhost:11434/api/generate</code>.
            </p>
          </div>

          {/* Section 3: Supabase Setup */}
          <div className="bg-[#111113] border border-[#27272A] rounded-lg p-5 space-y-3">
            <h2 className="text-sm font-bold text-[#FAFAFA] flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              3. Supabase PostgreSQL + pgvector Deployment
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-xs text-[#A1A1AA]">
              <li>Create a free project at <span className="text-[#FAFAFA]">supabase.com</span>.</li>
              <li>Open the <b>SQL Editor</b> in your Supabase dashboard.</li>
              <li>Copy and execute <code className="text-cyan-300">supabase/schema.sql</code> to enable <code className="text-[#FAFAFA]">pgvector</code> and tables.</li>
              <li>Execute <code className="text-cyan-300">supabase/seed.sql</code> to populate benchmark experiments.</li>
              <li>Set environment variables in <code className="text-cyan-300">frontend/.env</code>:
                <pre className="bg-[#09090B] p-2 rounded border border-[#27272A] text-cyan-300 mt-1">
                  VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
                </pre>
              </li>
            </ol>
          </div>
        </div>

        {/* Right Column: Quick References */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#111113] border border-[#27272A] rounded-lg p-4 space-y-2">
            <div className="text-[10px] text-[#A1A1AA] uppercase font-bold">CORE METRICS GLOSSARY</div>
            <div className="space-y-2 text-[11px]">
              <div>
                <b className="text-cyan-400">Faithfulness:</b>
                <p className="text-[#A1A1AA]">Percentage of claims in generated output supported by retrieved evidence context.</p>
              </div>
              <div>
                <b className="text-emerald-400">Answer Relevance:</b>
                <p className="text-[#A1A1AA]">Semantic similarity between the generated response and the input user question.</p>
              </div>
              <div>
                <b className="text-purple-400">Context Precision:</b>
                <p className="text-[#A1A1AA]">Signal-to-noise ratio evaluating whether top-ranked chunks contain gold answers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
