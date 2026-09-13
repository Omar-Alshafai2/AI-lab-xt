-- ==============================================================================
-- CORTEXLAB: Supabase Seed Data
-- Preloaded research experiments, benchmark datasets, and model evaluations
-- ==============================================================================

-- 1. Preload Experiments
INSERT INTO experiments (id, title, task_type, model_name, embedding_model, status, parameters, metrics, tags)
VALUES
(
    'EXP-00427',
    'RAG Benchmark: Chunk 512 + Cross-Encoder Reranker',
    'rag_benchmark',
    'Llama-3.1-8B-Instruct',
    'BAAI/bge-large-en-v1.5',
    'completed',
    '{"chunk_size": 512, "overlap": 64, "top_k": 5, "reranker": true, "similarity_metric": "cosine", "temperature": 0.3}'::jsonb,
    '{"faithfulness": 0.942, "relevance": 0.907, "context_precision": 0.915, "latency_ms": 842.0, "tokens_per_sec": 67.4}'::jsonb,
    ARRAY['rag', 'production', 'llama3', 'reranker']
),
(
    'EXP-00428',
    'RAG Baseline: Chunk 256 + Dense Cosine (No Rerank)',
    'rag_benchmark',
    'Llama-3.1-8B-Instruct',
    'BAAI/bge-large-en-v1.5',
    'completed',
    '{"chunk_size": 256, "overlap": 32, "top_k": 3, "reranker": false, "similarity_metric": "cosine", "temperature": 0.3}'::jsonb,
    '{"faithfulness": 0.865, "relevance": 0.812, "context_precision": 0.840, "latency_ms": 430.0, "tokens_per_sec": 84.1}'::jsonb,
    ARRAY['rag', 'baseline', 'ablation']
),
(
    'EXP-00429',
    'RAG Long Context: Chunk 1024 + Top-K 8',
    'rag_benchmark',
    'Llama-3.1-8B-Instruct',
    'BAAI/bge-large-en-v1.5',
    'completed',
    '{"chunk_size": 1024, "overlap": 128, "top_k": 8, "reranker": true, "similarity_metric": "cosine", "temperature": 0.3}'::jsonb,
    '{"faithfulness": 0.910, "relevance": 0.884, "context_precision": 0.871, "latency_ms": 1240.0, "tokens_per_sec": 52.8}'::jsonb,
    ARRAY['rag', 'long-context', 'stress-test']
),
(
    'EXP-00430',
    'Mistral NeMo 12B Prompt Optimization (CoT vs Direct)',
    'prompt_eval',
    'Mistral-NeMo-12B',
    NULL,
    'completed',
    '{"prompt_style": "chain_of_thought", "temperature": 0.2, "top_p": 0.95, "max_tokens": 1024}'::jsonb,
    '{"accuracy": 0.924, "reasoning_steps_avg": 5.4, "latency_ms": 1120.0, "tokens_per_sec": 58.2}'::jsonb,
    ARRAY['prompting', 'cot', 'mistral']
),
(
    'EXP-00431',
    'MiniLM vs BGE-Large Embedding Space Clustering',
    'embedding_finetune',
    'SentenceTransformers',
    'all-MiniLM-L6-v2',
    'completed',
    '{"projection": "UMAP", "dims": 384, "neighbors": 15, "min_dist": 0.1}'::jsonb,
    '{"silhouette_score": 0.684, "davies_bouldin": 1.12, "clustering_purity": 0.892}'::jsonb,
    ARRAY['embeddings', 'umap', 'evaluation']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Preload Model Benchmarks
INSERT INTO model_benchmarks (model_id, model_family, parameter_count_b, quantization, latency_ms, tokens_per_sec, vram_mb, context_window, mmlu_score, gsm8k_score, humaneval_score, rag_faithfulness, cost_per_1m_tokens)
VALUES
('llama-3.1-8b-instruct', 'Llama', 8.0, 'Q4_K_M', 510.0, 94.2, 5120, 131072, 73.0, 84.5, 72.6, 92.4, 0.000),
('llama-3.1-70b-instruct', 'Llama', 70.0, 'Q4_K_M', 1840.0, 28.5, 41200, 131072, 86.0, 95.1, 80.5, 96.1, 0.000),
('mistral-nemo-12b', 'Mistral', 12.2, 'Q8_0', 820.0, 61.4, 12800, 128000, 76.5, 81.2, 70.4, 91.2, 0.000),
('gemma-2-9b-it', 'Gemma', 9.2, 'FP16', 760.0, 68.0, 18400, 8192, 75.8, 83.0, 71.2, 90.8, 0.000),
('phi-3.5-mini-instruct', 'Phi', 3.8, 'FP16', 310.0, 142.0, 7800, 128000, 69.2, 82.5, 68.0, 88.5, 0.000),
('claude-3-5-sonnet', 'Claude', 0.0, 'Cloud API', 640.0, 82.0, 0, 200000, 88.7, 96.4, 92.0, 97.4, 3.000),
('gpt-4o', 'GPT', 0.0, 'Cloud API', 580.0, 88.0, 0, 128000, 88.0, 95.8, 90.2, 96.8, 5.000);

-- 3. Preload Datasets
INSERT INTO datasets (id, name, category, row_count, column_count, missing_value_pct, duplicate_count, summary_stats)
VALUES
(
    'ds-arxiv-ai',
    'ArXiv AI Research Corpus (2024-2026)',
    'ai_research',
    48291,
    12,
    2.40,
    183,
    '{"primary_classes": ["cs.CL", "cs.LG", "cs.AI", "cs.CV"], "avg_token_length": 248, "vocabulary_size": 64200}'::jsonb
),
(
    'ds-rag-eval',
    'RAG Multi-Hop Question Answering Benchmark',
    'nlp_benchmark',
    12400,
    8,
    0.00,
    12,
    '{"context_chunks_avg": 5.2, "supported_answers_pct": 94.2, "hard_negatives": 1800}'::jsonb
),
(
    'ds-sentiment-finance',
    'Financial News Sentiment & Entity Analysis',
    'tabular',
    24150,
    9,
    1.15,
    45,
    '{"labels": ["bullish", "bearish", "neutral"], "class_distribution": {"neutral": 0.52, "bullish": 0.28, "bearish": 0.20}}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
