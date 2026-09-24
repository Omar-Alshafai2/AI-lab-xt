import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Binary, BarChart2, Copy, Check, Cpu, RefreshCw, AlertCircle } from 'lucide-react';
import { useMLWorker } from '../../lib/useMLWorker';

const TOKEN_COLORS = [
  'bg-cyan-500/20 border-cyan-500/50 text-cyan-200',
  'bg-violet-500/20 border-violet-500/50 text-violet-200',
  'bg-emerald-500/20 border-emerald-500/50 text-emerald-200',
  'bg-amber-500/20 border-amber-500/50 text-amber-200',
  'bg-pink-500/20 border-pink-500/50 text-pink-200',
  'bg-sky-500/20 border-sky-500/50 text-sky-200',
  'bg-orange-500/20 border-orange-500/50 text-orange-200',
  'bg-teal-500/20 border-teal-500/50 text-teal-200',
];

const MODEL_OPTIONS = [
  { id: 'llama-3.1-8b-instruct', label: 'Llama 3.1 (Meta)', vocabSize: '128,256', note: 'tiktoken-style BPE' },
  { id: 'mistral-nemo-12b', label: 'Mistral (Mistral AI)', vocabSize: '32,768', note: 'SentencePiece BPE' },
  { id: 'gemma-2-9b-it', label: 'Gemma 2 (Google)', vocabSize: '256,128', note: 'SentencePiece BPE' },
];

const PRESETS = [
  'Transformers are amazing.',
  "The animal didn't cross the street because it was tired.",
  'function softmax(x) { return Math.exp(x) / sum(Math.exp(x)); }',
  '日本語のトークン化はどのように機能しますか？',
  'AI LAB XT: Interactive AI Research Laboratory — built with ❤️',
];

export const TokenizationLab: React.FC = () => {
  const [text, setText] = useState('Transformers are amazing.');
  const [modelId, setModelId] = useState(MODEL_OPTIONS[0].id);
  const [tokens, setTokens] = useState<string[]>([]);
  const [ids, setIds] = useState<number[]>([]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [isTokenizing, setIsTokenizing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { tokenize } = useMLWorker((s, detail) => {
    if (s === 'loading_model') {
      setStatus('loading');
      setStatusMsg(`Downloading tokenizer: ${detail ?? ''}...`);
    } else if (s === 'ready') {
      setStatus('ready');
      setStatusMsg(`Tokenizer ready: ${detail ?? ''}`);
    }
  });

  const runTokenize = useCallback(async (inputText: string, mid: string) => {
    if (!inputText.trim()) { setTokens([]); setIds([]); return; }
    setIsTokenizing(true);
    try {
      const result = await tokenize(inputText, mid);
      setTokens(result.tokens);
      setIds(result.ids);
      if (status !== 'loading') setStatus('ready');
    } catch (e) {
      setStatus('error');
      setStatusMsg(String(e));
    } finally {
      setIsTokenizing(false);
    }
  }, [tokenize, status]);

  // Debounce tokenization on text change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runTokenize(text, modelId);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [text, modelId]);

  const charCount = text.length;
  const tokenCount = tokens.length;
  const ratio = charCount > 0 ? (charCount / Math.max(1, tokenCount)).toFixed(2) : '—';
  const selectedModel = MODEL_OPTIONS.find(m => m.id === modelId)!;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(ids));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-mono font-bold text-[#FAFAFA] tracking-wide">TOKENIZATION LAB</h1>
            <span className={`px-2 py-0.5 rounded border text-[10px] font-mono ${
              status === 'ready'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : status === 'loading'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            }`}>
              {status === 'loading' ? '⟳ LOADING TOKENIZER' : status === 'ready' ? '● REAL TOKENIZER' : 'HUGGINGFACE WASM'}
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] font-sans mt-0.5">
            Real model tokenizers run in-browser via WebAssembly — actual vocabulary IDs, no simulation.
          </p>
        </div>

        {/* Model Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-[#A1A1AA]">TOKENIZER:</label>
          <select
            value={modelId}
            onChange={e => setModelId(e.target.value)}
            className="bg-[#18181B] border border-[#27272A] text-xs font-mono text-[#FAFAFA] px-3 py-1.5 rounded focus:outline-none focus:border-cyan-500"
          >
            {MODEL_OPTIONS.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status bar */}
      {(status === 'loading' || status === 'error') && (
        <div className={`flex items-center gap-2 p-3 rounded border text-xs font-mono ${
          status === 'error'
            ? 'bg-red-500/5 border-red-500/30 text-red-400'
            : 'bg-amber-500/5 border-amber-500/30 text-amber-300'
        }`}>
          {status === 'loading'
            ? <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
            : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
          <span>{statusMsg || 'Downloading tokenizer model (~2–5 MB, cached after first load)...'}</span>
        </div>
      )}

      {/* Preset Chips */}
      <div className="flex flex-wrap gap-2">
        <span className="text-[11px] font-mono text-[#71717A] mr-1 self-center">PRESETS:</span>
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => setText(p)}
            className={`px-2.5 py-1 rounded border text-[11px] font-mono transition-all ${
              text === p
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-[#3F3F46]'
            }`}
          >
            {p.slice(0, 30)}{p.length > 30 ? '…' : ''}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Input */}
        <div className="space-y-3">
          <div className="bg-[#111113] border border-[#27272A] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-[#18181B] border-b border-[#27272A]">
              <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">Input Text</span>
              <span className="text-[11px] font-mono text-[#71717A]">{charCount} chars</span>
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full h-36 bg-[#09090B] p-4 text-sm font-mono text-[#FAFAFA] focus:outline-none resize-none leading-relaxed"
              placeholder="Type anything to tokenize..."
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Tokens', value: isTokenizing ? '...' : tokenCount, icon: <Binary className="w-3.5 h-3.5 text-cyan-400" /> },
              { label: 'Chars/Token', value: isTokenizing ? '...' : ratio, icon: <BarChart2 className="w-3.5 h-3.5 text-violet-400" /> },
              { label: 'Vocab', value: selectedModel.vocabSize, icon: <Cpu className="w-3.5 h-3.5 text-emerald-400" /> },
            ].map(s => (
              <div key={s.label} className="bg-[#111113] border border-[#27272A] rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#71717A] uppercase">{s.icon}{s.label}</div>
                <div className="text-lg font-mono font-bold text-[#FAFAFA] tabular-nums">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Model Info */}
          <div className="bg-[#111113] border border-[#27272A] rounded-lg p-4 text-xs font-mono space-y-2">
            <div className="text-[#71717A] uppercase tracking-wider mb-1">Tokenizer Info</div>
            <div className="flex justify-between"><span className="text-[#A1A1AA]">Model</span><span className="text-[#FAFAFA]">{selectedModel.label}</span></div>
            <div className="flex justify-between"><span className="text-[#A1A1AA]">Algorithm</span><span className="text-[#FAFAFA]">{selectedModel.note}</span></div>
            <div className="flex justify-between"><span className="text-[#A1A1AA]">Vocab size</span><span className="text-cyan-300">{selectedModel.vocabSize}</span></div>
            <div className="flex justify-between"><span className="text-[#A1A1AA]">Runtime</span><span className="text-emerald-400">Browser WASM ✓</span></div>
          </div>
        </div>

        {/* Token Visualization */}
        <div className="space-y-3">
          <div className="bg-[#111113] border border-[#27272A] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-[#18181B] border-b border-[#27272A]">
              <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">Token Visualization</span>
              {isTokenizing && <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
            </div>
            <div className="p-4 min-h-32 flex flex-wrap gap-1.5">
              {tokens.length === 0 && !isTokenizing && (
                <span className="text-[#3F3F46] text-xs font-mono italic">Type something to see real tokens...</span>
              )}
              {tokens.map((tok, i) => (
                <span
                  key={i}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`px-1.5 py-0.5 rounded border text-xs font-mono cursor-default transition-all whitespace-pre ${
                    TOKEN_COLORS[i % TOKEN_COLORS.length]
                  } ${hoveredIdx === i ? 'scale-110 z-10 relative shadow-lg' : ''}`}
                >
                  {tok.replace(/ /g, '▁') || '▁'}
                </span>
              ))}
            </div>
          </div>

          {/* Hovered Token Detail */}
          {hoveredIdx !== null && tokens[hoveredIdx] && (
            <div className="bg-[#111113] border border-cyan-500/30 rounded-lg p-4 text-xs font-mono space-y-2">
              <div className="text-cyan-400 font-semibold uppercase tracking-wider text-[10px]">Token Detail</div>
              <div className="flex justify-between"><span className="text-[#A1A1AA]">Token text</span><span className="text-[#FAFAFA]">"{tokens[hoveredIdx].replace(/ /g, '▁')}"</span></div>
              <div className="flex justify-between"><span className="text-[#A1A1AA]">Vocab ID</span><span className="text-cyan-300 tabular-nums">{ids[hoveredIdx]}</span></div>
              <div className="flex justify-between"><span className="text-[#A1A1AA]">Position</span><span className="text-[#FAFAFA]">{hoveredIdx} / {tokens.length - 1}</span></div>
              <div className="flex justify-between"><span className="text-[#A1A1AA]">Bytes</span><span className="text-violet-300">{new TextEncoder().encode(tokens[hoveredIdx]).length} B</span></div>
            </div>
          )}

          {/* Raw IDs */}
          <div className="bg-[#111113] border border-[#27272A] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-[#18181B] border-b border-[#27272A]">
              <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">Vocabulary IDs</span>
              <button
                onClick={handleCopy}
                disabled={ids.length === 0}
                className="flex items-center gap-1.5 text-[11px] font-mono text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
            </div>
            <div className="p-3 max-h-36 overflow-y-auto">
              <div className="flex flex-wrap gap-1">
                {ids.map((id, i) => (
                  <span
                    key={i}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-mono tabular-nums cursor-default transition-all ${
                      hoveredIdx === i
                        ? 'bg-cyan-500/20 text-cyan-200'
                        : 'bg-[#18181B] text-[#71717A] hover:text-[#A1A1AA]'
                    }`}
                  >
                    {id}
                  </span>
                ))}
                {ids.length === 0 && <span className="text-[#3F3F46] text-xs font-mono italic">No tokens yet</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenizationLab;
