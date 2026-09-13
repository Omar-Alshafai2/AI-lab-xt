import { Experiment } from './types';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Lightweight, zero-dependency REST client for Supabase PostgREST
 */
export async function fetchExperimentsFromDb(): Promise<Experiment[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/experiments?select=*&order=created_at.desc`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      console.warn(`[Supabase] Table 'experiments' not ready or returned HTTP ${res.status}: ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      taskType: row.task_type,
      modelName: row.model_name,
      embeddingModel: row.embedding_model,
      status: row.status,
      parameters: row.parameters || {},
      metrics: row.metrics || { latencyMs: 0, tokensPerSec: 0 },
      tags: row.tags || [],
      createdAt: row.created_at
    }));
  } catch (err) {
    console.warn('[Supabase] Operating with persistent local research cache:', err);
    return null;
  }
}

export async function saveExperimentToDb(exp: Experiment): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/experiments`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: exp.id,
        title: exp.title,
        task_type: exp.taskType,
        model_name: exp.modelName,
        embedding_model: exp.embeddingModel,
        status: exp.status,
        parameters: exp.parameters,
        metrics: exp.metrics,
        tags: exp.tags,
        created_at: new Date().toISOString()
      })
    });
    return res.ok;
  } catch (err) {
    console.error('[Supabase] Failed to save experiment:', err);
    return false;
  }
}
