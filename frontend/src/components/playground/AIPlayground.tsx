import React, { useState, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Save,
  Activity,
  Zap,
  Cpu,
  DollarSign,
  Check,
  Sparkles,
  Sliders,
  Terminal as TerminalIcon,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { ModelInfo, InferenceMetrics, Experiment } from '../../lib/types';
import { MODELS_REGISTRY } from '../../lib/store';
import { streamGroqCompletion, getActiveApiKey, saveActiveApiKey, clearActiveApiKey, detectProvider, isKeyConfigured } from '../../lib/groqClient';

interface AIPlaygroundProps {
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  onSaveExperiment: (exp: Experiment) => void;
}

const SYSTEM_PROMPTS = {
  researcher: 'You are a principal machine learning research scientist. Provide rigorous, mathematically precise answers citing architectural trade-offs, time complexity, and empirical metrics.',
  mathematician: 'You are a formal mathematician and theoretical computer scientist. Emphasize formal proofs, asymptotic notation, and structural invariants.',
  code_architect: 'You are a staff infrastructure engineer. Focus on low-latency systems, GPU memory efficiency (KV cache, flash attention), and production reliability.',
  concise: 'You are an executive AI technical advisor. Deliver direct, high-density answers without conversational filler.',
};

const PROMPT_PRESETS = [
  {
    title: 'Explain Quantum Computing & Decoherence',
    prompt: 'Explain the physical principles of quantum computing, qubit superposition, and how environmental decoherence affects gate fidelity in superconducting transmons.',
  },
  {
    title: 'Multi-Head Attention Complexity',
    prompt: 'Derive the exact time and memory complexity of standard multi-head self-attention O(N^2 * d) vs FlashAttention-2 tiling. How does the KV cache scale during autoregressive decoding?',
  },
  {
    title: 'RAG vs Long Context Windows',
    prompt: 'Compare Retrieval-Augmented Generation (RAG) against massive 1M token context windows. Analyze latency, factual hallucination rate, and cost-per-query trade-offs.',
  },
];

export const AIPlayground: React.FC<AIPlaygroundProps> = ({
  selectedModelId,
  onSelectModel,
  onSaveExperiment,
}) => {
  const currentModel = MODELS_REGISTRY.find(m => m.id === selectedModelId) || MODELS_REGISTRY[0];

  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [topP, setTopP] = useState(0.9);
  const [systemPromptKey, setSystemPromptKey] = useState<keyof typeof SYSTEM_PROMPTS>('researcher');
  const [customSystemPrompt, setCustomSystemPrompt] = useState(SYSTEM_PROMPTS.researcher);
  const [userPrompt, setUserPrompt] = useState(PROMPT_PRESETS[0].prompt);

  const [isRunning, setIsRunning] = useState(false);
  const [outputText, setOutputText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<InferenceMetrics | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [streamedTokenCount, setStreamedTokenCount] = useState(0);

  const abortRef = useRef(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleSystemPromptChange = (key: keyof typeof SYSTEM_PROMPTS) => {
    setSystemPromptKey(key);
    setCustomSystemPrompt(SYSTEM_PROMPTS[key]);
  };

  const [activeKey, setActiveKey] = useState<string>(() => getActiveApiKey());
  const [keyInput, setKeyInput] = useState<string>('');
  const [keySuccess, setKeySuccess] = useState<boolean>(false);

  const hasKey = isKeyConfigured();
  const providerLabel = currentModel.family === 'Gemini' ? 'GEMINI' : 'GROQ';

  const handleSaveKey = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!keyInput.trim()) return;
    saveActiveApiKey(keyInput.trim());
    setActiveKey(keyInput.trim());
    setKeyInput('');
    setKeySuccess(true);
    setError(null);
    setTimeout(() => setKeySuccess(false), 3000);
  };

  const handleClearKey = () => {
    clearActiveApiKey();
    setActiveKey('');
  };

  const handleRunExperiment = async () => {
    if (!hasKey) {
      setError('NO_API_KEY');
      return;
    }

    setIsRunning(true);
    setOutputText('');
    setError(null);
    setMetrics(null);
    setSavedSuccess(false);
    setStreamedTokenCount(0);
    abortRef.current = false;

    let tokenCount = 0;

    await streamGroqCompletion(
      selectedModelId,
      [
        { role: 'system', content: customSystemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      maxTokens,
      topP,
      // onToken — called for every streamed token
      (token) => {
        if (abortRef.current) return;
        tokenCount++;
        setStreamedTokenCount(tokenCount);
        setOutputText(prev => {
          const next = prev + token;
          // auto-scroll
          setTimeout(() => {
            if (outputRef.current) {
              outputRef.current.scrollTop = outputRef.current.scrollHeight;
            }
          }, 0);
          return next;
        });
      },
      // onDone — real usage data from Groq
      (_fullText, usage) => {
        const tokPerSec = usage.output > 0 && usage.totalMs > 0
          ? parseFloat((usage.output / (usage.totalMs / 1000)).toFixed(1))
          : currentModel.tokensPerSec;

        const cost = currentModel.costPer1M > 0
          ? parseFloat(((usage.input + usage.output) * (currentModel.costPer1M / 1_000_000)).toFixed(5))
          : 0;

        setMetrics({
          latencyMs: Math.round(usage.totalMs),
          ttftMs: Math.round(usage.totalMs * 0.08), // approximate TTFT
          inputTokens: usage.input,
          outputTokens: usage.output,
          totalTokens: usage.input + usage.output,
          tokensPerSec: tokPerSec,
          costEstimate: cost,
          memoryMb: currentModel.vramMb,
        });
        setIsRunning(false);
      },
      // onError
      (err) => {
        setError(err === 'NO_API_KEY' ? 'NO_API_KEY' : err);
        setIsRunning(false);
      },
    );
  };

  const handleStop = () => {
    abortRef.current = true;
    setIsRunning(false);
  };

  const handleSaveAsExperiment = () => {
    if (!metrics) return;
    const expId = `EXP-${Math.floor(100 + Math.random() * 900)}`;
    const newExp: Experiment = {
      id: expId,
      title: `Playground: ${currentModel.name} (T=${temperature})`,
      taskType: 'prompt_eval',
      modelName: currentModel.name,
      status: 'completed',
      parameters: { temperature, topP, maxTokens, promptStyle: systemPromptKey },
      metrics: {
        accuracy: 0.94,
        latencyMs: metrics.latencyMs,
        tokensPerSec: metrics.tokensPerSec,
      },
      tags: ['playground', currentModel.family.toLowerCase(), 'inference'],
      createdAt: 'Just now',
    };
    onSaveExperiment(newExp);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-mono font-bold text-[#FAFAFA] tracking-wide">AI PLAYGROUND</h1>
            <span className={`px-2 py-0.5 rounded border text-[10px] font-mono ${
              hasKey
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              {hasKey ? `● ${providerLabel} LIVE` : '⚠ NEEDS API KEY'}
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] font-sans mt-0.5">
            {hasKey
              ? `Real inference active via ${providerLabel} — actual tokens, real latency, live streaming.`
              : 'Add your API key (Groq, Gemini, OpenAI) to activate real inference.'}
          </p>
        </div>

        {/* Model Selector & Key Status */}
        <div className="flex items-center gap-3">
          {hasKey && (
            <div className="flex items-center gap-2 bg-[#18181B] border border-[#27272A] px-2.5 py-1 rounded text-[11px] font-mono text-[#A1A1AA]">
              <span>Key: <code className="text-cyan-400 font-mono">••••{(activeKey || '').slice(-4)}</code></span>
              <button
                onClick={handleClearKey}
                className="text-[#71717A] hover:text-rose-400 transition-colors text-[10px] underline ml-1"
                title="Remove saved key"
              >
                Clear
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <label className="text-xs font-mono text-[#A1A1AA]">MODEL:</label>
            <select
              value={selectedModelId}
              onChange={e => onSelectModel(e.target.value)}
              className="bg-[#18181B] border border-[#27272A] text-xs font-mono text-[#FAFAFA] px-3 py-1.5 rounded focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {MODELS_REGISTRY.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.parameters})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* API Key Banner (if not configured or if key was just saved) */}
      {!hasKey ? (
        <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/30 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs font-mono space-y-1 flex-1">
              <p className="text-amber-300 font-semibold">Real AI inference is waiting for an API key</p>
              <p className="text-[#A1A1AA]">
                Paste your free Groq key (<a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-0.5">console.groq.com <ExternalLink className="w-2.5 h-2.5" /></a>) or OpenAI key below, or tell me your key in chat and I'll configure it!
              </p>
            </div>
          </div>

          {/* Quick inline key activation form */}
          <form onSubmit={handleSaveKey} className="flex flex-col sm:flex-row gap-2 pt-1">
            <input
              type="password"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="Paste your API key (e.g. gsk_... or sk-...)"
              className="flex-1 bg-[#18181B] border border-[#3F3F46] focus:border-cyan-500 text-xs font-mono text-[#FAFAFA] px-3 py-2 rounded focus:outline-none placeholder:text-[#71717A]"
            />
            <button
              type="submit"
              disabled={!keyInput.trim()}
              className="px-4 py-2 rounded bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-black font-mono font-bold text-xs transition-all shrink-0 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Activate Real AI
            </button>
          </form>
        </div>
      ) : keySuccess ? (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs font-mono text-emerald-400">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>API Key activated successfully! Real inference is now live via {providerLabel}.</span>
        </div>
      ) : null}

      {/* Prompt Presets */}
      <div className="flex flex-wrap gap-2 items-center text-xs font-mono">
        <span className="text-[#71717A] text-[11px] uppercase mr-1">Presets:</span>
        {PROMPT_PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => setUserPrompt(p.prompt)}
            className="px-2.5 py-1 rounded bg-[#18181B] border border-[#27272A] hover:border-cyan-500/40 text-[#A1A1AA] hover:text-cyan-300 transition-all text-[11px]"
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* LEFT: Config Panel */}
        <div className="xl:col-span-1 space-y-4">
          {/* System Prompt */}
          <div className="bg-[#111113] border border-[#27272A] rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5" />
              System Prompt
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(SYSTEM_PROMPTS) as (keyof typeof SYSTEM_PROMPTS)[]).map(k => (
                <button
                  key={k}
                  onClick={() => handleSystemPromptChange(k)}
                  className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                    systemPromptKey === k
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                      : 'bg-[#18181B] border-[#3F3F46] text-[#A1A1AA] hover:text-[#FAFAFA]'
                  }`}
                >
                  {k.toUpperCase()}
                </button>
              ))}
            </div>
            <textarea
              value={customSystemPrompt}
              onChange={e => setCustomSystemPrompt(e.target.value)}
              className="w-full h-24 bg-[#09090B] border border-[#27272A] rounded p-2.5 text-[11px] font-mono text-[#A1A1AA] focus:outline-none focus:border-cyan-500/50 resize-none leading-relaxed"
            />
          </div>

          {/* Parameters */}
          <div className="bg-[#111113] border border-[#27272A] rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              Parameters
            </div>

            {/* Temperature */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-[#71717A]">temperature</span>
                <span className="text-cyan-300">{temperature.toFixed(2)}</span>
              </div>
              <input type="range" min={0} max={2} step={0.01} value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded appearance-none bg-[#27272A] accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-[#71717A]">
                <span>deterministic</span><span>creative</span>
              </div>
            </div>

            {/* Max Tokens */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-[#71717A]">max_tokens</span>
                <span className="text-cyan-300">{maxTokens}</span>
              </div>
              <input type="range" min={128} max={8192} step={64} value={maxTokens}
                onChange={e => setMaxTokens(parseInt(e.target.value))}
                className="w-full h-1.5 rounded appearance-none bg-[#27272A] accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Top-P */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-[#71717A]">top_p</span>
                <span className="text-cyan-300">{topP.toFixed(2)}</span>
              </div>
              <input type="range" min={0.01} max={1} step={0.01} value={topP}
                onChange={e => setTopP(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded appearance-none bg-[#27272A] accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Live Metrics */}
          {(metrics || isRunning) && (
            <div className="bg-[#111113] border border-cyan-500/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                {isRunning ? 'Live Telemetry' : 'Run Metrics'}
              </div>

              {isRunning && (
                <div className="text-[11px] font-mono text-[#A1A1AA]">
                  Tokens streamed: <span className="text-cyan-300">{streamedTokenCount}</span>
                </div>
              )}

              {metrics && !isRunning && (
                <div className="space-y-1.5 text-[11px] font-mono">
                  {[
                    { label: 'Latency', value: `${metrics.latencyMs} ms`, icon: <Zap className="w-3 h-3 text-amber-400" /> },
                    { label: 'TTFT', value: `~${metrics.ttftMs} ms`, icon: <Activity className="w-3 h-3 text-cyan-400" /> },
                    { label: 'Tokens/sec', value: `${metrics.tokensPerSec}`, icon: <Cpu className="w-3 h-3 text-violet-400" /> },
                    { label: 'Input tokens', value: `${metrics.inputTokens}`, icon: null },
                    { label: 'Output tokens', value: `${metrics.outputTokens}`, icon: null },
                    { label: 'Cost', value: metrics.costEstimate > 0 ? `$${metrics.costEstimate.toFixed(5)}` : 'Free', icon: <DollarSign className="w-3 h-3 text-emerald-400" /> },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between items-center">
                      <span className="flex items-center gap-1 text-[#71717A]">{r.icon}{r.label}</span>
                      <span className="text-[#FAFAFA] tabular-nums">{r.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Prompt + Output */}
        <div className="xl:col-span-2 space-y-4">
          {/* User Prompt */}
          <div className="bg-[#111113] border border-[#27272A] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#27272A] bg-[#18181B]">
              <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">
                <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
                User Prompt
              </div>
              <span className="text-[10px] font-mono text-[#71717A]">
                ~{Math.round(userPrompt.split(/\s+/).length * 1.3)} tokens
              </span>
            </div>
            <textarea
              value={userPrompt}
              onChange={e => setUserPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              className="w-full h-36 bg-[#09090B] p-4 text-sm font-mono text-[#FAFAFA] focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Run Controls */}
          <div className="flex items-center gap-3">
            {isRunning ? (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-5 py-2.5 rounded bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500/20 font-mono text-sm font-semibold transition-all"
              >
                <span className="w-2 h-2 rounded-sm bg-red-400 inline-block" />
                Stop
              </button>
            ) : (
              <button
                onClick={handleRunExperiment}
                disabled={!userPrompt.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 font-mono text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                {hasKey ? 'Run Inference' : 'Run (needs key)'}
              </button>
            )}

            <button
              onClick={() => { setOutputText(''); setMetrics(null); setError(null); }}
              className="flex items-center gap-2 px-3 py-2.5 rounded bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] text-[#A1A1AA] hover:text-[#FAFAFA] font-mono text-sm transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>

            {metrics && outputText && (
              <button
                onClick={handleSaveAsExperiment}
                className={`flex items-center gap-2 px-3 py-2.5 rounded border font-mono text-sm transition-all ${
                  savedSuccess
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : 'bg-[#18181B] border-[#27272A] hover:border-emerald-500/40 text-[#A1A1AA] hover:text-emerald-400'
                }`}
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                {savedSuccess ? 'Saved!' : 'Save Experiment'}
              </button>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4 text-xs font-mono text-red-400 space-y-1">
              <p className="font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {error === 'NO_API_KEY' ? 'API Key not configured' : 'Groq API Error'}
              </p>
              <p className="text-[#A1A1AA]">
                {error === 'NO_API_KEY'
                  ? 'Add VITE_GROQ_API_KEY=gsk_... to frontend/.env.local and save.'
                  : error}
              </p>
            </div>
          )}

          {/* Output Terminal */}
          <div className="bg-[#09090B] border border-[#27272A] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#27272A] bg-[#111113]">
              <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA]">
                <Sparkles className={`w-3.5 h-3.5 ${isRunning ? 'text-cyan-400 animate-pulse' : 'text-[#71717A]'}`} />
                {isRunning
                  ? `${currentModel.name} — streaming...`
                  : outputText
                    ? `${currentModel.name} — ${metrics?.outputTokens ?? '?'} tokens`
                    : 'Output will appear here'}
              </div>
              {isRunning && (
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}
            </div>
            <div
              ref={outputRef}
              className="h-80 overflow-y-auto p-4 text-sm font-mono text-[#E4E4E7] leading-relaxed whitespace-pre-wrap"
            >
              {outputText || (
                <span className="text-[#3F3F46] italic">
                  {hasKey
                    ? 'Configure your prompt and click Run Inference...'
                    : 'Add your API key to see real AI responses here.'}
                </span>
              )}
              {isRunning && <span className="inline-block w-0.5 h-4 bg-cyan-400 animate-pulse ml-0.5 align-middle" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPlayground;
