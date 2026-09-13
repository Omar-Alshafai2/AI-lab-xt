import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, Database, Send, Sparkles } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

export const APIExplorer: React.FC = () => {
  const [activeEndpoint, setActiveEndpoint] = useState<'rag' | 'embeddings' | 'tokenize' | 'experiments'>('rag');
  const [copied, setCopied] = useState(false);

  const endpoints = {
    rag: {
      method: 'POST',
      path: '/api/v1/rag/query',
      desc: 'Execute end-to-end RAG retrieval, cross-encoder reranking, and grounding evaluation.',
      curl: `curl -X POST "https://api.cortexlab.ai/v1/rag/query" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <API_KEY>" \\
  -d '{
    "query": "What is the proposed architecture of the Transformer?",
    "document_text": "The dominant sequence transduction models...",
    "chunk_size": 512,
    "overlap": 64,
    "top_k": 5,
    "reranker": true
  }'`,
      response: `{
  "pipeline": {
    "parsing": "completed",
    "chunking": { "count": 42, "status": "completed" },
    "embedding": { "model": "bge-large-en-v1.5", "status": "completed" },
    "retrieval": { "top_k": 5, "status": "completed" }
  },
  "retrieval": [
    { "chunk_id": 17, "similarity": 0.942, "content": "An attention function can be described..." },
    { "chunk_id": 4, "similarity": 0.865, "content": "We call our particular attention Scaled Dot-Product..." }
  ],
  "metrics": {
    "grounding_score": 94,
    "faithfulness": 0.942,
    "answer_relevance": 0.907,
    "context_relevance": 0.915,
    "latency_ms": 842.0
  }
}`
    },
    embeddings: {
      method: 'POST',
      path: '/api/v1/embeddings',
      desc: 'Generate dense vectors and project onto 2D/3D manifolds using PCA/t-SNE/UMAP.',
      curl: `curl -X POST "https://api.cortexlab.ai/v1/embeddings" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <API_KEY>" \\
  -d '{
    "inputs": ["Attention mechanism", "Quantum superposition"],
    "model": "all-MiniLM-L6-v2",
    "dimensions": 384
  }'`,
      response: `{
  "model": "all-MiniLM-L6-v2",
  "dimensions": 384,
  "vectors": [
    [0.023, -0.182, 0.442, 0.812, "..."],
    [-0.320, 0.210, 0.890, -0.420, "..."]
  ],
  "projection_2d": [
    { "x": 45.2, "y": 42.1 },
    { "x": -42.8, "y": 38.5 }
  ]
}`
    },
    tokenize: {
      method: 'POST',
      path: '/api/v1/tokenize',
      desc: 'Tokenize text with Llama-3 BPE, GPT-4o, or BERT WordPiece tokenizers.',
      curl: `curl -X POST "https://api.cortexlab.ai/v1/tokenize" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Transformers are amazing.",
    "model_type": "llama3_bpe"
  }'`,
      response: `{
  "tokens": ["Transform", "ers", " are", " amazing", "."],
  "token_ids": [4821, 311, 527, 8421, 13],
  "stats": {
    "characters": 25,
    "words": 3,
    "tokens": 5,
    "token_to_word_ratio": 1.67,
    "bytes_per_token": 5.0
  }
}`
    },
    experiments: {
      method: 'GET',
      path: '/api/v1/experiments',
      desc: 'Query logged research experiments from Supabase pgvector database.',
      curl: `curl -X GET "https://api.cortexlab.ai/v1/experiments?task_type=rag_benchmark" \\
  -H "Authorization: Bearer <API_KEY>"`,
      response: `{
  "experiments": [
    {
      "id": "EXP-00427",
      "title": "RAG Benchmark: Chunk 512 + Cross-Encoder Reranker",
      "model_name": "Llama-3.1-8B-Instruct",
      "metrics": { "faithfulness": 0.942, "latency_ms": 842.0 }
    }
  ],
  "source": "supabase"
}`
    }
  };

  const current = endpoints[activeEndpoint];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#FAFAFA] tracking-wide">
              DEVELOPER API & DATABASE INTEGRATION
            </h1>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-400">
              REST & PGVECTOR
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] font-sans mt-0.5">
            Integrate CortexLab research pipelines into external evaluation harnesses and CI/CD pipelines.
          </p>
        </div>

        {/* Supabase Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#111113] border border-[#27272A]">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>SUPABASE POSTGRESQL:</span>
          <span className={isSupabaseConfigured ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
            {isSupabaseConfigured ? 'CONNECTED' : 'LOCAL CACHE READY'}
          </span>
        </div>
      </div>

      {/* Supabase Integration Callout */}
      <div className="bg-[#111113] border border-cyan-500/30 rounded-lg p-5 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
          <Database className="w-4 h-4" />
          <span>SUPABASE PGVECTOR SCHEMA READY</span>
        </div>
        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          The Supabase database schema has been generated at <code className="text-cyan-300">supabase/schema.sql</code> and <code className="text-cyan-300">supabase/seed.sql</code> with <code className="text-[#FAFAFA]">CREATE EXTENSION IF NOT EXISTS vector</code>, HNSW indexing, and table definitions for experiments, documents, chunks, and evaluations. You can paste it directly into your Supabase SQL Editor with one click!
        </p>
      </div>

      {/* Endpoint Tabs */}
      <div className="flex gap-2 border-b border-[#27272A] pb-2">
        {(['rag', 'embeddings', 'tokenize', 'experiments'] as const).map(ep => (
          <button
            key={ep}
            onClick={() => setActiveEndpoint(ep)}
            className={`px-3 py-1.5 rounded uppercase font-bold text-xs transition-colors ${
              activeEndpoint === ep
                ? 'bg-cyan-500 text-black'
                : 'bg-[#18181B] text-[#A1A1AA] hover:text-[#FAFAFA]'
            }`}
          >
            {ep}
          </button>
        ))}
      </div>

      {/* Endpoint Documentation Card */}
      <div className="bg-[#111113] border border-[#27272A] rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
            current.method === 'POST' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
          }`}>
            {current.method}
          </span>
          <span className="text-sm font-bold text-[#FAFAFA]">{current.path}</span>
        </div>
        <p className="text-xs text-[#A1A1AA]">{current.desc}</p>

        {/* cURL Request */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] uppercase font-bold mb-1">
            <span>cURL REQUEST</span>
            <button
              onClick={() => handleCopy(current.curl)}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy cURL'}
            </button>
          </div>
          <pre className="bg-[#09090B] border border-[#27272A] p-3 rounded text-[11px] text-cyan-300 overflow-x-auto leading-relaxed">
            {current.curl}
          </pre>
        </div>

        {/* JSON Response */}
        <div>
          <div className="text-[11px] text-[#A1A1AA] uppercase font-bold mb-1">
            SAMPLE RESPONSE (200 OK)
          </div>
          <pre className="bg-[#09090B] border border-[#27272A] p-3 rounded text-[11px] text-[#FAFAFA] overflow-x-auto leading-relaxed">
            {current.response}
          </pre>
        </div>
      </div>
    </div>
  );
};
