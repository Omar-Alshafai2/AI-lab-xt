// =============================================================
// CORTEXLAB — useMLWorker hook
// Manages communication with the real @xenova/transformers
// Web Worker running in the background
// =============================================================

import { useEffect, useRef, useCallback } from 'react';

export type WorkerStatus = 'idle' | 'loading_model' | 'ready' | 'error';

export interface TokenizeResult {
  ids: number[];
  tokens: string[];
}

export interface EmbedQueryResult {
  queryVec: number[];
  rankedChunks: { idx: number; score: number; vec: number[] }[];
}

type PendingResolve<T> = {
  resolve: (v: T) => void;
  reject: (e: Error) => void;
};

let workerInstance: Worker | null = null;
let workerRefCount = 0;

function getWorker(): Worker {
  if (!workerInstance) {
    workerInstance = new Worker(
      new URL('./mlWorker.ts', import.meta.url),
      { type: 'module' }
    );
  }
  return workerInstance;
}

export function useMLWorker(onStatusChange?: (s: WorkerStatus, detail?: string) => void) {
  const pendingMap = useRef<Map<string, PendingResolve<unknown>>>(new Map());
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRefCount++;
    const worker = getWorker();
    workerRef.current = worker;

    const handler = (e: MessageEvent) => {
      const msg = e.data;

      if (msg.type === 'model_loading') {
        onStatusChange?.('loading_model', msg.model);
      } else if (msg.type === 'model_ready') {
        onStatusChange?.('ready', msg.model);
      } else if (msg.type === 'tokenizer_loading') {
        onStatusChange?.('loading_model', msg.model);
      } else if (msg.type === 'tokenizer_ready') {
        onStatusChange?.('ready', msg.model);
      } else if (msg.type === 'tokenize_result' && msg.id) {
        const p = pendingMap.current.get(msg.id);
        if (p) { p.resolve({ ids: msg.ids, tokens: msg.tokens }); pendingMap.current.delete(msg.id); }
      } else if (msg.type === 'tokenize_error' && msg.id) {
        const p = pendingMap.current.get(msg.id);
        if (p) { p.reject(new Error(msg.error)); pendingMap.current.delete(msg.id); }
      } else if (msg.type === 'embed_result' && msg.id) {
        const p = pendingMap.current.get(msg.id);
        if (p) { p.resolve(msg.embeddings); pendingMap.current.delete(msg.id); }
      } else if (msg.type === 'embed_query_result' && msg.id) {
        const p = pendingMap.current.get(msg.id);
        if (p) { p.resolve({ queryVec: msg.queryVec, rankedChunks: msg.rankedChunks }); pendingMap.current.delete(msg.id); }
      } else if (msg.type === 'embed_query_error' && msg.id) {
        const p = pendingMap.current.get(msg.id);
        if (p) { p.reject(new Error(msg.error)); pendingMap.current.delete(msg.id); }
      }
    };

    worker.addEventListener('message', handler);
    return () => {
      worker.removeEventListener('message', handler);
      workerRefCount--;
    };
  }, []);

  const tokenize = useCallback((text: string, modelId: string): Promise<TokenizeResult> => {
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      pendingMap.current.set(id, { resolve: resolve as (v: unknown) => void, reject });
      workerRef.current?.postMessage({ type: 'tokenize', id, text, modelId });
    });
  }, []);

  const embed = useCallback((sentences: string[]): Promise<number[][]> => {
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      pendingMap.current.set(id, { resolve: resolve as (v: unknown) => void, reject });
      workerRef.current?.postMessage({ type: 'embed', id, sentences });
    });
  }, []);

  const embedAndRank = useCallback(
    (query: string, chunks: string[]): Promise<EmbedQueryResult> => {
      return new Promise((resolve, reject) => {
        const id = crypto.randomUUID();
        pendingMap.current.set(id, { resolve: resolve as (v: unknown) => void, reject });
        workerRef.current?.postMessage({ type: 'embed_query', id, query, chunks });
      });
    },
    []
  );

  return { tokenize, embed, embedAndRank };
}
