import { ModelInfo, Experiment, DatasetMeta } from './types';

export const MODELS_REGISTRY: ModelInfo[] = [
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash (Google)',
    family: 'Gemini',
    parameters: 'Multimodal',
    contextWindow: 1048576,
    latencyMs: 190,
    tokensPerSec: 160.0,
    vramMb: 0,
    costPer1M: 0.075,
    scores: { mmlu: 88.5, gsm8k: 94.2, humanEval: 86.8, faithfulness: 96.5 },
    description: 'Google DeepMind state-of-the-art fast reasoning model with deep thought signatures.',
    status: 'online'
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash (Google)',
    family: 'Gemini',
    parameters: 'Multimodal',
    contextWindow: 1048576,
    latencyMs: 220,
    tokensPerSec: 140.0,
    vramMb: 0,
    costPer1M: 0.10,
    scores: { mmlu: 90.1, gsm8k: 95.8, humanEval: 88.4, faithfulness: 97.2 },
    description: 'Next-generation Gemini architecture with enhanced factual precision.',
    status: 'online'
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'OpenAI GPT-OSS 20B (Groq)',
    family: 'GPT',
    parameters: '20B',
    contextWindow: 131072,
    latencyMs: 140,
    tokensPerSec: 285.0,
    vramMb: 14200,
    costPer1M: 0.0,
    scores: { mmlu: 82.5, gsm8k: 89.2, humanEval: 82.0, faithfulness: 94.6 },
    description: 'High-speed reasoning and code generation model hosted on Groq LPU.',
    status: 'online'
  },
  {
    id: 'qwen/qwen3.6-27b',
    name: 'Qwen 3.6 27B',
    family: 'Qwen',
    parameters: '27B',
    contextWindow: 131072,
    latencyMs: 210,
    tokensPerSec: 180.0,
    vramMb: 18200,
    costPer1M: 0.0,
    scores: { mmlu: 84.8, gsm8k: 92.4, humanEval: 84.1, faithfulness: 95.8 },
    description: 'Ultra-capable reasoning engine with step-by-step thinking traces on Groq.',
    status: 'online'
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'OpenAI GPT-OSS 120B',
    family: 'GPT',
    parameters: '120B',
    contextWindow: 131072,
    latencyMs: 420,
    tokensPerSec: 110.0,
    vramMb: 65000,
    costPer1M: 0.0,
    scores: { mmlu: 89.2, gsm8k: 96.0, humanEval: 89.5, faithfulness: 97.8 },
    description: 'Massive enterprise-scale open weights foundation model on Groq.',
    status: 'online'
  },
  {
    id: 'allam-2-7b',
    name: 'Allam 2 7B (Bilingual)',
    family: 'Allam',
    parameters: '7B',
    contextWindow: 32768,
    latencyMs: 90,
    tokensPerSec: 320.0,
    vramMb: 5800,
    costPer1M: 0.0,
    scores: { mmlu: 74.2, gsm8k: 82.0, humanEval: 71.0, faithfulness: 93.0 },
    description: 'Specialized Arabic and English high-performance bilingual LLM on Groq.',
    status: 'online'
  },
  {
    id: 'llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B (via Groq)',
    family: 'Llama',
    parameters: '8.0B',
    contextWindow: 131072,
    latencyMs: 510,
    tokensPerSec: 94.2,
    vramMb: 5120,
    costPer1M: 0.0,
    scores: { mmlu: 73.0, gsm8k: 84.5, humanEval: 72.6, faithfulness: 92.4 },
    description: 'Meta AI open weights foundation model, routed via Groq inference.',
    status: 'online'
  },
  {
    id: 'llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B Instruct',
    family: 'Llama',
    parameters: '70.6B',
    contextWindow: 131072,
    latencyMs: 1840,
    tokensPerSec: 28.5,
    vramMb: 41200,
    costPer1M: 0.0,
    scores: { mmlu: 86.0, gsm8k: 95.1, humanEval: 80.5, faithfulness: 96.1 },
    description: 'Frontier open weights model rivaling commercial proprietary architectures.',
    status: 'online'
  },
  {
    id: 'mistral-nemo-12b',
    name: 'Mistral NeMo 12B',
    family: 'Mistral',
    parameters: '12.2B',
    contextWindow: 128000,
    latencyMs: 820,
    tokensPerSec: 61.4,
    vramMb: 12800,
    costPer1M: 0.0,
    scores: { mmlu: 76.5, gsm8k: 81.2, humanEval: 70.4, faithfulness: 91.2 },
    description: 'Trained jointly with NVIDIA featuring high multilingual & code fluency.',
    status: 'online'
  },
  {
    id: 'gemma-2-9b-it',
    name: 'Gemma 2 9B IT',
    family: 'Gemma',
    parameters: '9.2B',
    contextWindow: 8192,
    latencyMs: 760,
    tokensPerSec: 68.0,
    vramMb: 18400,
    costPer1M: 0.0,
    scores: { mmlu: 75.8, gsm8k: 83.0, humanEval: 71.2, faithfulness: 90.8 },
    description: 'Google DeepMind lightweight architecture with sliding window attention.',
    status: 'online'
  },
  {
    id: 'phi-3.5-mini-instruct',
    name: 'Phi-3.5 Mini Instruct',
    family: 'Phi',
    parameters: '3.8B',
    contextWindow: 128000,
    latencyMs: 310,
    tokensPerSec: 142.0,
    vramMb: 7800,
    costPer1M: 0.0,
    scores: { mmlu: 69.2, gsm8k: 82.5, humanEval: 68.0, faithfulness: 88.5 },
    description: 'Ultra-fast small language model trained on synthetic textbooks & reasoning data.',
    status: 'online'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    family: 'Claude',
    parameters: 'Proprietary',
    contextWindow: 200000,
    latencyMs: 640,
    tokensPerSec: 82.0,
    vramMb: 0,
    costPer1M: 3.0,
    scores: { mmlu: 88.7, gsm8k: 96.4, humanEval: 92.0, faithfulness: 97.4 },
    description: 'State-of-the-art coding and complex graduate-level reasoning benchmark leader.',
    status: 'cloud'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o (OpenAI)',
    family: 'GPT',
    parameters: 'Proprietary',
    contextWindow: 128000,
    latencyMs: 580,
    tokensPerSec: 88.0,
    vramMb: 0,
    costPer1M: 5.0,
    scores: { mmlu: 88.0, gsm8k: 95.8, humanEval: 90.2, faithfulness: 96.8 },
    description: 'OpenAI flagship multimodal model with unified omni architecture.',
    status: 'cloud'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini (OpenAI)',
    family: 'GPT',
    parameters: 'Proprietary',
    contextWindow: 128000,
    latencyMs: 320,
    tokensPerSec: 130.0,
    vramMb: 0,
    costPer1M: 0.15,
    scores: { mmlu: 82.0, gsm8k: 91.5, humanEval: 82.2, faithfulness: 94.2 },
    description: 'Fast, lightweight frontier intelligence from OpenAI.',
    status: 'cloud'
  }
];

export const INITIAL_EXPERIMENTS: Experiment[] = [
  {
    id: 'EXP-00427',
    title: 'RAG Benchmark: Chunk 512 + Cross-Encoder Reranker',
    taskType: 'rag_benchmark',
    modelName: 'Llama-3.1-8B-Instruct',
    embeddingModel: 'BAAI/bge-large-en-v1.5',
    status: 'completed',
    parameters: {
      chunkSize: 512,
      overlap: 64,
      topK: 5,
      reranker: true,
      similarityMetric: 'Cosine',
      temperature: 0.3
    },
    metrics: {
      faithfulness: 0.942,
      relevance: 0.907,
      contextPrecision: 0.915,
      latencyMs: 842.0,
      tokensPerSec: 67.4
    },
    tags: ['rag', 'production', 'llama3', 'reranker'],
    createdAt: '2 mins ago'
  },
  {
    id: 'EXP-00428',
    title: 'RAG Baseline: Chunk 256 + Dense Cosine (No Rerank)',
    taskType: 'rag_benchmark',
    modelName: 'Llama-3.1-8B-Instruct',
    embeddingModel: 'BAAI/bge-large-en-v1.5',
    status: 'completed',
    parameters: {
      chunkSize: 256,
      overlap: 32,
      topK: 3,
      reranker: false,
      similarityMetric: 'Cosine',
      temperature: 0.3
    },
    metrics: {
      faithfulness: 0.865,
      relevance: 0.812,
      contextPrecision: 0.840,
      latencyMs: 430.0,
      tokensPerSec: 84.1
    },
    tags: ['rag', 'baseline', 'ablation'],
    createdAt: '10 mins ago'
  },
  {
    id: 'EXP-00429',
    title: 'RAG Long Context: Chunk 1024 + Top-K 8',
    taskType: 'rag_benchmark',
    modelName: 'Llama-3.1-8B-Instruct',
    embeddingModel: 'BAAI/bge-large-en-v1.5',
    status: 'completed',
    parameters: {
      chunkSize: 1024,
      overlap: 128,
      topK: 8,
      reranker: true,
      similarityMetric: 'Cosine',
      temperature: 0.3
    },
    metrics: {
      faithfulness: 0.910,
      relevance: 0.884,
      contextPrecision: 0.871,
      latencyMs: 1240.0,
      tokensPerSec: 52.8
    },
    tags: ['rag', 'long-context', 'stress-test'],
    createdAt: '45 mins ago'
  },
  {
    id: 'EXP-00430',
    title: 'Mistral NeMo 12B Prompt Optimization (CoT vs Direct)',
    taskType: 'prompt_eval',
    modelName: 'Mistral-NeMo-12B',
    status: 'completed',
    parameters: {
      promptStyle: 'Chain of Thought',
      temperature: 0.2,
      topP: 0.95,
      maxTokens: 1024
    },
    metrics: {
      accuracy: 0.924,
      latencyMs: 1120.0,
      tokensPerSec: 58.2
    },
    tags: ['prompting', 'cot', 'mistral'],
    createdAt: '2 hours ago'
  },
  {
    id: 'EXP-00431',
    title: 'SentenceTransformers MiniLM UMAP Projection',
    taskType: 'embedding_finetune',
    modelName: 'all-MiniLM-L6-v2',
    embeddingModel: 'all-MiniLM-L6-v2',
    status: 'completed',
    parameters: {
      similarityMetric: 'Cosine'
    },
    metrics: {
      accuracy: 0.892,
      latencyMs: 280.0,
      tokensPerSec: 195.0
    },
    tags: ['embeddings', 'umap', 'clustering'],
    createdAt: '3 hours ago'
  }
];

export const PRELOADED_DATASETS: DatasetMeta[] = [
  {
    id: 'ds-arxiv-ai',
    name: 'ArXiv AI Research Corpus (2024-2026)',
    category: 'ai_research',
    rowCount: 48291,
    columnCount: 12,
    missingValuePct: 2.4,
    duplicateCount: 183,
    sizeMb: 142.8,
    columns: [
      { name: 'paper_id', type: 'VARCHAR', nulls: 0, unique: 48291 },
      { name: 'title', type: 'TEXT', nulls: 0, unique: 48108 },
      { name: 'abstract', type: 'TEXT', nulls: 14, unique: 48010 },
      { name: 'category', type: 'CATEGORICAL', nulls: 0, unique: 18 },
      { name: 'token_count', type: 'INTEGER', nulls: 0, unique: 612 },
      { name: 'citation_count', type: 'INTEGER', nulls: 0, unique: 485 },
      { name: 'year', type: 'INTEGER', nulls: 0, unique: 3 }
    ],
    distribution: [
      { label: 'cs.CL (Computation & Language)', count: 21240, percentage: 44.0 },
      { label: 'cs.LG (Machine Learning)', count: 15450, percentage: 32.0 },
      { label: 'cs.AI (Artificial Intelligence)', count: 7240, percentage: 15.0 },
      { label: 'cs.CV (Computer Vision)', count: 4361, percentage: 9.0 }
    ],
    aiAnalysis: 'Computed Diagnostics: Dataset exhibits high text density (mean token count: 248.4, std: 42.1). Noticeable class imbalance in cs.CL (44.0%) versus cs.CV (9.0%). 2.4% missing values detected in abstract field requiring imputation before embedding generation.'
  },
  {
    id: 'ds-rag-eval',
    name: 'RAG Multi-Hop Question Answering Benchmark',
    category: 'nlp_benchmark',
    rowCount: 12400,
    columnCount: 8,
    missingValuePct: 0.0,
    duplicateCount: 12,
    sizeMb: 58.4,
    columns: [
      { name: 'query_id', type: 'VARCHAR', nulls: 0, unique: 12400 },
      { name: 'question', type: 'TEXT', nulls: 0, unique: 12388 },
      { name: 'gold_context', type: 'TEXT', nulls: 0, unique: 12400 },
      { name: 'ground_truth_answer', type: 'TEXT', nulls: 0, unique: 12400 },
      { name: 'hops', type: 'INTEGER', nulls: 0, unique: 4 },
      { name: 'domain', type: 'CATEGORICAL', nulls: 0, unique: 6 }
    ],
    distribution: [
      { label: '2-Hop Synthesis', count: 6820, percentage: 55.0 },
      { label: '3-Hop Reasoning', count: 3720, percentage: 30.0 },
      { label: 'Single-Hop Factoid', count: 1860, percentage: 15.0 }
    ],
    aiAnalysis: 'Computed Diagnostics: 0.00% missing values indicates curated high-fidelity dataset. 55% of queries require multi-chunk evidence stitching (2-hop). Standard single-chunk retrieval pipelines will suffer approximately 38% context recall loss without reranking or query decomposition.'
  },
  {
    id: 'ds-sentiment-finance',
    name: 'Financial News Sentiment & Entity Analysis',
    category: 'tabular',
    rowCount: 24150,
    columnCount: 9,
    missingValuePct: 1.15,
    duplicateCount: 45,
    sizeMb: 36.2,
    columns: [
      { name: 'id', type: 'INTEGER', nulls: 0, unique: 24150 },
      { name: 'headline', type: 'TEXT', nulls: 0, unique: 24105 },
      { name: 'sentiment', type: 'CATEGORICAL', nulls: 0, unique: 3 },
      { name: 'ticker_symbol', type: 'CATEGORICAL', nulls: 278, unique: 520 },
      { name: 'confidence', type: 'FLOAT', nulls: 0, unique: 100 }
    ],
    distribution: [
      { label: 'Neutral', count: 12558, percentage: 52.0 },
      { label: 'Bullish (Positive)', count: 6762, percentage: 28.0 },
      { label: 'Bearish (Negative)', count: 4830, percentage: 20.0 }
    ],
    aiAnalysis: 'Computed Diagnostics: 52% of observations are classified as Neutral. High confidence scores (>0.85) correlate strongly with specific monetary tokens ($B, % increase). 1.15% missing ticker symbols correspond to general macroeconomic sentiment summaries.'
  }
];
