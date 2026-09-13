import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  FileText, 
  Sliders, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Play, 
  Database,
  Sparkles,
  Info,
  ChevronDown,
  Upload
} from 'lucide-react';
import { SAMPLE_DOCUMENTS, chunkText, executeRAGQuery } from '../../lib/algorithms/ragEngine';
import { RAGChunk, RAGEvalMetrics } from '../../lib/types';
import { streamGroqCompletion, getActiveApiKey } from '../../lib/groqClient';

export const RAGLaboratory: React.FC = () => {
  const [selectedDocId, setSelectedDocId] = useState(SAMPLE_DOCUMENTS[0].id);
  const [chunkSize, setChunkSize] = useState(512);
  const [overlap, setOverlap] = useState(64);
  const [topK, setTopK] = useState(5);
  const [useReranker, setUseReranker] = useState(true);
  const [query, setQuery] = useState('What is the proposed architecture of the Transformer model?');

  const [activeTab, setActiveTab] = useState<'pipeline' | 'chunks' | 'failure_analysis'>('pipeline');
  const [selectedChunk, setSelectedChunk] = useState<RAGChunk | null>(null);

  // Ingested document state
  const activeDoc = SAMPLE_DOCUMENTS.find(d => d.id === selectedDocId) || SAMPLE_DOCUMENTS[0];
  const [chunks, setChunks] = useState<RAGChunk[]>([]);
  
  // Pipeline execution results
  const [isExecuting, setIsExecuting] = useState(false);
  const [retrievedChunks, setRetrievedChunks] = useState<RAGChunk[]>([]);
  const [answer, setAnswer] = useState('');
  const [metrics, setMetrics] = useState<RAGEvalMetrics | null>(null);
  const [executionStep, setExecutionStep] = useState<number>(5); // 0 to 5

  // Re-chunk whenever document, chunkSize, or overlap changes
  useEffect(() => {
    const computedChunks = chunkText(activeDoc.text, chunkSize, overlap);
    setChunks(computedChunks);
    if (computedChunks.length > 0) {
      setSelectedChunk(computedChunks[0]);
    }
  }, [selectedDocId, chunkSize, overlap, activeDoc.text]);

  // Initial execution on mount
  useEffect(() => {
    handleRunRAG();
  }, [selectedDocId, chunkSize, overlap]);

  const handleRunRAG = () => {
    setIsExecuting(true);
    setExecutionStep(1); // Parsing

    setTimeout(() => {
      setExecutionStep(2); // Chunking
      setTimeout(() => {
        setExecutionStep(3); // Embedding
        setTimeout(() => {
          setExecutionStep(4); // Retrieval & Reranker
          setTimeout(async () => {
            setExecutionStep(5); // Generation
            const currentChunks = chunkText(activeDoc.text, chunkSize, overlap);
            const result = executeRAGQuery(query, currentChunks, topK, useReranker);
            setRetrievedChunks(result.retrievedChunks);
            setMetrics(result.metrics);

            const apiKey = getActiveApiKey();
            if (apiKey && result.retrievedChunks.length > 0 && !result.metrics.isFailure) {
              setAnswer('Synthesizing grounded answer with real Groq LLM...');
              const context = result.retrievedChunks.map((c, i) => `[Source ${i+1} - Chunk #${c.id}]:\n${c.content}`).join('\n\n');
              const ragPrompt = `You are an AI research assistant performing Retrieval-Augmented Generation. Answer the user query clearly and accurately using ONLY the provided document sources. Cite the source number.\n\nContext Documents:\n${context}\n\nQuery: ${query}`;

              let liveText = '';
              await streamGroqCompletion(
                'openai/gpt-oss-20b',
                [
                  { role: 'system', content: 'You are an accurate AI research scientist. Ground all claims in the provided context.' },
                  { role: 'user', content: ragPrompt }
                ],
                0.2,
                512,
                0.9,
                (token) => {
                  liveText += token;
                  setAnswer(liveText);
                },
                (full) => {
                  setAnswer(full);
                  setIsExecuting(false);
                },
                () => {
                  setAnswer(result.answer);
                  setIsExecuting(false);
                }
              );
            } else {
              setAnswer(result.answer);
              setIsExecuting(false);
            }
          }, 200);
        }, 200);
      }, 200);
    }, 200);
  };

  const testFailureQueries = [
    { label: 'Normal: Transformer Architecture', q: 'What is the proposed architecture of the Transformer model?' },
    { label: 'Normal: RAG vs Fine-tuning', q: 'How does non-parametric memory combine with pre-trained transformers?' },
    { label: 'Failure Test: Out of Domain', q: 'What is the average temperature on the surface of Mars?' },
    { label: 'Failure Test: Hallucination Trigger', q: 'Explain why the architecture uses quantum gravitational neural nodes.' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-mono font-bold text-[#FAFAFA] tracking-wide">
              RAG LABORATORY & FAILURE ANALYSIS
            </h1>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-400">
              SIGNATURE MODULE
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] font-sans mt-0.5">
            Evaluate ingestion, chunk boundaries, dense vector retrieval, cross-encoder reranking, and root-cause failure diagnostics.
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={handleRunRAG}
          disabled={isExecuting}
          className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold flex items-center gap-2 shadow-glow-cyan transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-black" />
          {isExecuting ? 'EXECUTING PIPELINE...' : 'EXECUTE PIPELINE'}
        </button>
      </div>

      {/* Pipeline Visualizer (Section 7 Spec) */}
      <div className="bg-[#111113] border border-[#27272A] rounded-lg p-4 font-mono text-xs">
        <div className="text-[10px] uppercase text-[#A1A1AA] font-bold mb-3 flex items-center gap-2">
          <span>ACTIVE RAG INGESTION & RETRIEVAL PIPELINE</span>
          {isExecuting && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Step 1: Parsing */}
          <div className={`p-3 rounded border transition-all ${
            executionStep >= 1 ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-300' : 'bg-[#18181B] border-[#27272A] text-[#71717A]'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold">1. PARSING</span>
              {executionStep >= 1 ? <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> : <span className="text-[10px]">○</span>}
            </div>
            <div className="text-[11px] text-[#FAFAFA] font-medium truncate">{activeDoc.title.split('(')[0]}</div>
            <div className="text-[10px] text-[#A1A1AA] mt-1">{activeDoc.pages} Pages • UTF-8</div>
          </div>

          {/* Step 2: Chunking */}
          <div className={`p-3 rounded border transition-all ${
            executionStep >= 2 ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-300' : 'bg-[#18181B] border-[#27272A] text-[#71717A]'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold">2. CHUNKING</span>
              {executionStep >= 2 ? <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> : <span className="text-[10px]">○</span>}
            </div>
            <div className="text-[11px] text-[#FAFAFA] font-medium">{chunks.length} Chunks</div>
            <div className="text-[10px] text-[#A1A1AA] mt-1">Size: {chunkSize} | Overlap: {overlap}</div>
          </div>

          {/* Step 3: Embedding */}
          <div className={`p-3 rounded border transition-all ${
            executionStep >= 3 ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-300' : 'bg-[#18181B] border-[#27272A] text-[#71717A]'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold">3. EMBEDDING</span>
              {executionStep >= 3 ? <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> : <span className="text-[10px]">○</span>}
            </div>
            <div className="text-[11px] text-[#FAFAFA] font-medium">BGE-Large-EN</div>
            <div className="text-[10px] text-[#A1A1AA] mt-1">1024-dim • HNSW Index</div>
          </div>

          {/* Step 4: Retrieval */}
          <div className={`p-3 rounded border transition-all ${
            executionStep >= 4 ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-300' : 'bg-[#18181B] border-[#27272A] text-[#71717A]'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold">4. RETRIEVAL</span>
              {executionStep >= 4 ? <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> : <span className="text-[10px]">○</span>}
            </div>
            <div className="text-[11px] text-[#FAFAFA] font-medium">Top-{topK} Matches</div>
            <div className="text-[10px] text-[#A1A1AA] mt-1">{useReranker ? 'Cross-Encoder ✓' : 'Dense Cosine'}</div>
          </div>

          {/* Step 5: Generation */}
          <div className={`p-3 rounded border transition-all ${
            executionStep >= 5 ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-300' : 'bg-[#18181B] border-[#27272A] text-[#71717A]'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold">5. GENERATION</span>
              {executionStep >= 5 ? <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> : <span className="text-[10px]">○</span>}
            </div>
            <div className="text-[11px] text-[#FAFAFA] font-medium">Grounded LLM</div>
            <div className="text-[10px] text-[#A1A1AA] mt-1">Faithfulness: {metrics?.faithfulness || 0.94}</div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Configuration Controls & Document Selector */}
        <div className="lg:col-span-4 space-y-4">
          {/* Document Ingestion Card */}
          <div className="bg-[#111113] border border-[#27272A] rounded-lg p-4 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] uppercase font-bold border-b border-[#27272A] pb-2">
              <span>INGESTED CORPUS</span>
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
            </div>

            <select
              value={selectedDocId}
              onChange={e => setSelectedDocId(e.target.value)}
              className="w-full bg-[#18181B] border border-[#27272A] text-xs font-mono text-[#FAFAFA] p-2 rounded focus:outline-none focus:border-cyan-500"
            >
              {SAMPLE_DOCUMENTS.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.title}
                </option>
              ))}
            </select>

            <div className="text-[11px] text-[#A1A1AA] bg-[#09090B] p-2.5 rounded border border-[#27272A] leading-relaxed">
              <span className="text-[#FAFAFA] font-semibold block mb-1">Document Synopsis:</span>
              {activeDoc.text.slice(0, 160)}...
            </div>
          </div>

          {/* Hyperparameters Card */}
          <div className="bg-[#111113] border border-[#27272A] rounded-lg p-4 font-mono text-xs space-y-4">
            <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] uppercase font-bold border-b border-[#27272A] pb-2">
              <span>PIPELINE HYPERPARAMETERS</span>
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            </div>

            {/* Chunk Size */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#A1A1AA]">Chunk Size (characters)</span>
                <span className="text-cyan-400 font-bold">{chunkSize}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[128, 256, 512, 1024].map(size => (
                  <button
                    key={size}
                    onClick={() => setChunkSize(size)}
                    className={`py-1 rounded text-[11px] font-mono border ${
                      chunkSize === size 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold' 
                        : 'bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:text-[#FAFAFA]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Chunk Overlap */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#A1A1AA]">Chunk Overlap</span>
                <span className="text-cyan-400 font-bold">{overlap}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 32, 64, 128].map(ov => (
                  <button
                    key={ov}
                    onClick={() => setOverlap(ov)}
                    className={`py-1 rounded text-[11px] font-mono border ${
                      overlap === ov 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold' 
                        : 'bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:text-[#FAFAFA]'
                    }`}
                  >
                    {ov}
                  </button>
                ))}
              </div>
            </div>

            {/* Top K */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#A1A1AA]">Top K Retrieved</span>
                <span className="text-cyan-400 font-bold">{topK}</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={topK}
                onChange={e => setTopK(parseInt(e.target.value))}
                className="w-full accent-cyan-400 bg-[#27272A] h-1.5 rounded cursor-pointer"
              />
            </div>

            {/* Cross-Encoder Reranker Toggle */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[#FAFAFA] font-medium block">Cross-Encoder Reranker</span>
                <span className="text-[10px] text-[#71717A]">Rescore Top-K using joint attention</span>
              </div>
              <button
                onClick={() => setUseReranker(!useReranker)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  useReranker ? 'bg-cyan-500' : 'bg-[#27272A]'
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform ${
                  useReranker ? 'right-0.5' : 'left-0.5'
                }`}></span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Question & Failure Analysis Engine (Section 8 Spec) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Query input card with test presets */}
          <div className="bg-[#111113] border border-[#27272A] rounded-lg p-4 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] uppercase font-bold">
              <span>RESEARCH QUESTION</span>
              <span className="text-[10px] text-[#71717A]">Try failure diagnostics queries below</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask a question about the ingested document..."
                className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-3 py-2 text-xs font-mono text-[#FAFAFA] focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleRunRAG}
                disabled={isExecuting}
                className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1.5 transition-colors"
              >
                Query
              </button>
            </div>

            {/* Failure test buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {testFailureQueries.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(item.q);
                  }}
                  className="px-2 py-0.5 rounded bg-[#18181B] border border-[#27272A] hover:border-cyan-500/50 text-[#A1A1AA] hover:text-[#FAFAFA] text-[10px] transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 8: Failure Analysis & Grounding Dashboard */}
          {metrics && (
            <div className={`bg-[#111113] border rounded-lg p-5 font-mono space-y-4 ${
              metrics.isFailure ? 'border-red-500/50 bg-red-950/10' : 'border-[#27272A]'
            }`}>
              {/* Failure vs Success Banner */}
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2">
                  {metrics.isFailure ? (
                    <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <span>⚠ RAG FAILURE DETECTED</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>✓ SUPPORTED BY RETRIEVED EVIDENCE</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-[#A1A1AA]">
                  DIAGNOSTIC STATUS: <b className={metrics.isFailure ? 'text-red-400' : 'text-emerald-400'}>
                    {metrics.isFailure ? metrics.failureType : 'OPTIMAL'}
                  </b>
                </div>
              </div>

              {/* Failure Details (if failure detected) */}
              {metrics.isFailure && (
                <div className="bg-red-950/30 border border-red-800/40 p-3.5 rounded text-xs space-y-1.5">
                  <div className="text-red-300 font-bold flex items-center gap-1.5">
                    <span>Failure Mode:</span>
                    <span className="text-red-200">{metrics.failureType}</span>
                  </div>
                  <div className="text-[#A1A1AA] leading-relaxed">
                    <b>Root Cause:</b> {metrics.potentialCause}
                  </div>
                  <div className="text-[11px] text-red-400 pt-1">
                    Top relevant chunk similarity: <b>{metrics.topSimilarity}</b> (Required: &gt; 0.55)
                  </div>
                </div>
              )}

              {/* Retrieval Chunks Score Breakdown (Section 8 Spec) */}
              <div>
                <div className="text-[11px] text-[#A1A1AA] uppercase font-bold mb-2">
                  RETRIEVAL EVIDENCE (TOP {retrievedChunks.length})
                </div>
                <div className="space-y-1.5">
                  {retrievedChunks.map((chunk, idx) => (
                    <div
                      key={chunk.id}
                      className="p-2.5 rounded bg-[#18181B] border border-[#27272A] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="font-bold text-cyan-400 shrink-0">
                          Chunk #{chunk.id.toString().padStart(2, '0')}
                        </span>
                        <span className="text-[#A1A1AA] truncate text-[11px]">
                          {chunk.content}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="text-[10px] text-[#71717A]">similarity</span>
                        <span className={`font-bold tabular-nums px-1.5 py-0.5 rounded text-xs ${
                          chunk.similarity >= 0.85 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : chunk.similarity >= 0.65
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}>
                          {chunk.similarity.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grounding Meter (Section 8 Spec) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#A1A1AA] font-bold">GROUNDING SCORE</span>
                  <span className="font-bold text-cyan-400">{metrics.groundingScore}%</span>
                </div>
                <div className="h-2.5 bg-[#18181B] rounded-full border border-[#27272A] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      metrics.groundingScore > 75 
                        ? 'bg-gradient-to-r from-cyan-500 to-emerald-400' 
                        : 'bg-gradient-to-r from-amber-500 to-red-500'
                    }`}
                    style={{ width: `${metrics.groundingScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Generation Evaluation Tri-Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#18181B] p-3 rounded border border-[#27272A] text-center">
                  <div className="text-[10px] text-[#A1A1AA] uppercase mb-1">FAITHFULNESS</div>
                  <div className="text-lg font-bold text-emerald-400 tabular-nums">
                    {metrics.faithfulness.toFixed(2)}
                  </div>
                </div>

                <div className="bg-[#18181B] p-3 rounded border border-[#27272A] text-center">
                  <div className="text-[10px] text-[#A1A1AA] uppercase mb-1">ANSWER RELEVANCE</div>
                  <div className="text-lg font-bold text-cyan-400 tabular-nums">
                    {metrics.answerRelevance.toFixed(2)}
                  </div>
                </div>

                <div className="bg-[#18181B] p-3 rounded border border-[#27272A] text-center">
                  <div className="text-[10px] text-[#A1A1AA] uppercase mb-1">CONTEXT RELEVANCE</div>
                  <div className="text-lg font-bold text-[#FAFAFA] tabular-nums">
                    {metrics.contextRelevance.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Generated Answer */}
              <div className="bg-[#09090B] border border-[#27272A] p-4 rounded text-xs leading-relaxed text-[#FAFAFA] whitespace-pre-wrap">
                <div className="text-[10px] text-[#71717A] uppercase font-bold mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SYNTHESIZED ANSWER</span>
                </div>
                {answer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
