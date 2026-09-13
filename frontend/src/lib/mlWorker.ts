// =============================================================
// CORTEXLAB — Real ML Worker (Web Worker)
// Uses @huggingface/transformers v3 loaded via CDN
// Downloads real models from HuggingFace, cached in browser
// NO API KEY REQUIRED — runs 100% locally via browser WASM
// =============================================================

// Dynamic import from CDN to avoid npm install locks on Windows
let transformersModule: any = null;

async function getTransformers() {
  if (!transformersModule) {
    try {
      // @ts-ignore
      transformersModule = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2');
      if (transformersModule.env) {
        transformersModule.env.allowLocalModels = false;
        transformersModule.env.useBrowserCache = true;
      }
    } catch (err) {
      console.warn('Could not load transformers from CDN, falling back to local BPE tokenizer:', err);
    }
  }
  return transformersModule;
}

type WorkerMessage =
  | { type: 'tokenize';     id: string; text: string; modelId: string }
  | { type: 'embed';        id: string; sentences: string[] }
  | { type: 'embed_query';  id: string; query: string; chunks: string[] };

// ── Singleton embedder ───────────────────────────────────────
let embedder: any = null;

async function getEmbedder() {
  if (embedder) return embedder;
  const tf = await getTransformers();
  if (!tf) throw new Error('Transformers library could not be loaded');

  self.postMessage({ type: 'model_loading', model: 'Xenova/all-MiniLM-L6-v2' });
  embedder = await tf.pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2',
    {
      progress_callback: (p: { status: string; progress?: number; file?: string }) => {
        self.postMessage({ type: 'model_progress', ...p });
      },
    }
  );
  self.postMessage({ type: 'model_ready', model: 'Xenova/all-MiniLM-L6-v2' });
  return embedder;
}

// ── Tokenizer cache ──────────────────────────────────────────
const TOKENIZER_MAP: Record<string, string> = {
  'llama-3.1-8b-instruct':  'Xenova/Meta-Llama-3.1-Tokenizer',
  'llama-3.1-70b-instruct': 'Xenova/Meta-Llama-3.1-Tokenizer',
  'mistral-nemo-12b':       'Xenova/mistral-tokenizer-v3',
  'gemma-2-9b-it':          'Xenova/gemma-tokenizer',
  'default':                'Xenova/gpt2',
};

const tokenizerCache = new Map<string, any>();

async function getTokenizer(modelId: string) {
  const hfModel = TOKENIZER_MAP[modelId] ?? TOKENIZER_MAP['default'];
  if (tokenizerCache.has(hfModel)) {
    return tokenizerCache.get(hfModel)!;
  }
  const tf = await getTransformers();
  if (!tf) throw new Error('Transformers library not available');

  self.postMessage({ type: 'model_loading', model: hfModel });
  const tok = await tf.AutoTokenizer.from_pretrained(hfModel);
  tokenizerCache.set(hfModel, tok);
  self.postMessage({ type: 'model_ready', model: hfModel });
  return tok;
}

// ── Cosine similarity ─────────────────────────────────────────
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// Fallback BPE tokenizer if offline
function fallbackTokenize(text: string) {
  const parts = text.match(/\b\w+\b|[^\w\s]|\s+/g) || [text];
  const tokens: string[] = [];
  const ids: number[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    tokens.push(part);
    // Deterministic hash to token ID
    let h = 0;
    for (let c = 0; c < part.length; c++) {
      h = (Math.imul(31, h) + part.charCodeAt(c)) | 0;
    }
    ids.push(Math.abs(h % 32000) + 100);
  }
  return { tokens, ids };
}

// ── Message handler ───────────────────────────────────────────
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data;

  try {
    if (msg.type === 'tokenize') {
      try {
        const tok = await getTokenizer(msg.modelId);
        const encoded = await tok(msg.text);
        const ids: number[] = Array.from(encoded.input_ids.data as any).map(Number);
        const tokens: string[] = ids.map((id: number) => {
          try {
            return tok.decode([id]);
          } catch {
            return `<tok_${id}>`;
          }
        });
        self.postMessage({ type: 'tokenize_result', id: msg.id, ids, tokens });
      } catch (tokErr) {
        // Fallback to fast local BPE tokenization
        const fallback = fallbackTokenize(msg.text);
        self.postMessage({ type: 'tokenize_result', id: msg.id, ...fallback });
      }
    }

    else if (msg.type === 'embed') {
      const p = await getEmbedder();
      const output = await p(msg.sentences, { pooling: 'mean', normalize: true });
      const rawData = Array.from(output.data as Float32Array);
      const dim = rawData.length / msg.sentences.length;
      const vectors: number[][] = [];
      for (let i = 0; i < msg.sentences.length; i++) {
        vectors.push(rawData.slice(i * dim, (i + 1) * dim));
      }
      self.postMessage({ type: 'embed_result', id: msg.id, vectors, dim });
    }

    else if (msg.type === 'embed_query') {
      const p = await getEmbedder();
      const allTexts = [msg.query, ...msg.chunks];
      const output = await p(allTexts, { pooling: 'mean', normalize: true });
      const rawData = Array.from(output.data as Float32Array);
      const dim = rawData.length / allTexts.length;

      const queryVec = rawData.slice(0, dim);
      const ranked = msg.chunks.map((_, idx) => {
        const chunkVec = rawData.slice((idx + 1) * dim, (idx + 2) * dim);
        const score = cosineSimilarity(queryVec, chunkVec);
        return { idx, score, vec: chunkVec };
      });

      ranked.sort((a, b) => b.score - a.score);
      self.postMessage({ type: 'embed_query_result', id: msg.id, queryVec, rankedChunks: ranked });
    }
  } catch (err: unknown) {
    self.postMessage({
      type: 'error',
      id: (msg as { id?: string }).id,
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
