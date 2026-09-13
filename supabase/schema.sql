-- ==============================================================================
-- CORTEXLAB: Supabase Database Schema
-- Interactive AI Laboratory for Understanding, Evaluating, & Experimenting
-- PostgreSQL + pgvector Schema
-- ==============================================================================

-- 1. Enable pgvector extension for high-performance vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Experiments Table
-- Logs all research experiments (RAG ablations, prompt evaluations, benchmark runs)
CREATE TABLE IF NOT EXISTS experiments (
    id TEXT PRIMARY KEY,                       -- e.g. 'EXP-00427'
    title TEXT NOT NULL,                      -- e.g. 'RAG Benchmark: Chunk 512 + Reranker'
    task_type TEXT NOT NULL,                  -- 'rag_benchmark' | 'prompt_eval' | 'embedding_finetune' | 'model_eval'
    model_name TEXT NOT NULL,                 -- e.g. 'Llama-3.1-8B-Instruct'
    embedding_model TEXT,                     -- e.g. 'BAAI/bge-large-en-v1.5'
    status TEXT NOT NULL DEFAULT 'completed', -- 'running' | 'completed' | 'failed'
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb, -- { chunk_size: 512, overlap: 64, top_k: 5, reranker: true, temperature: 0.7 }
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,    -- { faithfulness: 0.942, relevance: 0.907, context_precision: 0.915, latency_ms: 842, tokens_per_sec: 67.4 }
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index on task_type and created_at
CREATE INDEX IF NOT EXISTS idx_experiments_task_type ON experiments(task_type);
CREATE INDEX IF NOT EXISTS idx_experiments_created_at ON experiments(created_at DESC);

-- 3. Documents Table
-- Ingested research papers, technical specs, and corpora
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    source_type TEXT NOT NULL,                -- 'pdf' | 'txt' | 'arxiv' | 'json'
    file_size_bytes INTEGER NOT NULL DEFAULT 0,
    page_count INTEGER NOT NULL DEFAULT 1,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Chunks & Vector Embeddings Table
-- Chunks extracted from documents with 384-dimensional or 1536-dimensional embeddings
CREATE TABLE IF NOT EXISTS chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER NOT NULL DEFAULT 0,
    embedding vector(384),                    -- Compatible with all-MiniLM-L6-v2 / BGE-small (can be altered to 1536 for OpenAI)
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb, -- { start_char: 0, end_char: 512, section: 'Abstract' }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- HNSW Vector Index for sub-millisecond approximate nearest neighbor (ANN) retrieval
CREATE INDEX IF NOT EXISTS idx_chunks_embedding_hnsw 
ON chunks USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 5. Datasets Explorer Table
-- Stored datasets for statistical diagnostics, embedding visualizer, and classification tests
CREATE TABLE IF NOT EXISTS datasets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,                   -- 'ai_research' | 'nlp_benchmark' | 'sentiment' | 'tabular'
    row_count INTEGER NOT NULL DEFAULT 0,
    column_count INTEGER NOT NULL DEFAULT 0,
    missing_value_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    duplicate_count INTEGER NOT NULL DEFAULT 0,
    summary_stats JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Model Benchmarks Table
-- Systematic telemetry and benchmark evaluations across LLM models
CREATE TABLE IF NOT EXISTS model_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id TEXT NOT NULL,
    model_family TEXT NOT NULL,               -- 'Llama' | 'Mistral' | 'Gemma' | 'Claude' | 'GPT'
    parameter_count_b NUMERIC(5, 1) NOT NULL,
    quantization TEXT NOT NULL,               -- 'FP16' | 'Q8_0' | 'Q4_K_M' | 'Cloud'
    latency_ms NUMERIC(7, 1) NOT NULL,
    tokens_per_sec NUMERIC(6, 1) NOT NULL,
    vram_mb INTEGER NOT NULL,
    context_window INTEGER NOT NULL,
    mmlu_score NUMERIC(5, 2) NOT NULL,
    gsm8k_score NUMERIC(5, 2) NOT NULL,
    humaneval_score NUMERIC(5, 2) NOT NULL,
    rag_faithfulness NUMERIC(5, 2) NOT NULL,
    cost_per_1m_tokens NUMERIC(6, 3) NOT NULL,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Supabase RPC Function: Vector Similarity Search
-- Performs cosine similarity search over chunks table
CREATE OR REPLACE FUNCTION match_chunks (
    query_embedding vector(384),
    match_threshold float DEFAULT 0.65,
    match_count int DEFAULT 5,
    doc_id uuid DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    document_id uuid,
    chunk_index int,
    content text,
    similarity float,
    metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        chunks.id,
        chunks.document_id,
        chunks.chunk_index,
        chunks.content,
        1 - (chunks.embedding <=> query_embedding) AS similarity,
        chunks.metadata
    FROM chunks
    WHERE 
        (doc_id IS NULL OR chunks.document_id = doc_id)
        AND (1 - (chunks.embedding <=> query_embedding)) >= match_threshold
    ORDER BY chunks.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
