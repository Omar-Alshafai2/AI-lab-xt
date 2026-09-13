export type ActiveView = 
  | 'landing'
  | 'overview'
  | 'playground'
  | 'rag'
  | 'embeddings'
  | 'tokenization'
  | 'attention'
  | 'benchmarks'
  | 'datasets'
  | 'experiments'
  | 'evaluations'
  | 'comparisons'
  | 'papers'
  | 'models'
  | 'api'
  | 'docs';

export interface ModelInfo {
  id: string;
  name: string;
  family: string;
  parameters: string;
  contextWindow: number;
  latencyMs: number;
  tokensPerSec: number;
  vramMb: number;
  costPer1M: number;
  scores: {
    mmlu: number;
    gsm8k: number;
    humanEval: number;
    faithfulness: number;
  };
  description: string;
  status: 'online' | 'local' | 'cloud';
}

export interface InferenceMetrics {
  latencyMs: number;
  ttftMs: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  tokensPerSec: number;
  costEstimate: number;
  memoryMb: number;
}

export interface RAGChunk {
  id: number;
  content: string;
  similarity: number;
  startChar: number;
  endChar: number;
  section?: string;
}

export interface RAGEvalMetrics {
  faithfulness: number;
  answerRelevance: number;
  contextRelevance: number;
  groundingScore: number;
  isFailure: boolean;
  failureType: string;
  potentialCause: string;
  topSimilarity: number;
}

export interface EmbeddingPoint {
  id: number;
  title: string;
  category: 'tech' | 'science' | 'sports' | 'ai';
  text: string;
  vector: number[];
  x2d: number;
  y2d: number;
  x3d: number;
  y3d: number;
  z3d: number;
  nearestNeighbors?: { id: number; title: string; similarity: number }[];
}

export interface TokenBreakdown {
  token: string;
  id: number;
  bytes: string[];
  color: string;
}

export interface AttentionData {
  tokens: string[];
  layer: number;
  head: number;
  specialization: string;
  matrix: number[][];
}

export interface Experiment {
  id: string;
  title: string;
  taskType: 'rag_benchmark' | 'prompt_eval' | 'embedding_finetune' | 'model_eval';
  modelName: string;
  embeddingModel?: string;
  status: 'completed' | 'running' | 'failed';
  parameters: {
    chunkSize?: number;
    overlap?: number;
    topK?: number;
    reranker?: boolean;
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    similarityMetric?: string;
    promptStyle?: string;
  };
  metrics: {
    faithfulness?: number;
    relevance?: number;
    contextPrecision?: number;
    accuracy?: number;
    latencyMs: number;
    tokensPerSec: number;
  };
  tags: string[];
  createdAt: string;
}

export interface DatasetMeta {
  id: string;
  name: string;
  category: string;
  rowCount: number;
  columnCount: number;
  missingValuePct: number;
  duplicateCount: number;
  sizeMb: number;
  columns: { name: string; type: string; nulls: number; unique: number }[];
  distribution: { label: string; count: number; percentage: number }[];
  aiAnalysis: string;
}
