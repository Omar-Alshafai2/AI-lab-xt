// =============================================================
// CORTEXLAB — Multi-Provider LLM Client
// Supports Groq (LPUs), Google Gemini, OpenAI
// Streaming SSE character-by-character with live telemetry
// =============================================================

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamUsage {
  input: number;
  output: number;
  totalMs: number;
}

// Active Groq models
const GROQ_MODEL_MAP: Record<string, string> = {
  'openai/gpt-oss-20b':     'openai/gpt-oss-20b',
  'openai/gpt-oss-120b':    'openai/gpt-oss-120b',
  'qwen/qwen3.6-27b':       'qwen/qwen3.6-27b',
  'qwen/qwen3.8-27b':       'qwen/qwen3.8-27b',
  'allam-2-7b':             'allam-2-7b',
  'groq/compound':          'groq/compound',
  'groq/compound-mini':     'groq/compound-mini',
  'llama-3.1-8b-instruct':  'openai/gpt-oss-20b',
  'llama-3.1-70b-instruct': 'openai/gpt-oss-120b',
  'mistral-nemo-12b':       'qwen/qwen3.6-27b',
  'gemma-2-9b-it':          'qwen/qwen3.8-27b',
  'qwen2.5-7b-instruct':    'qwen/qwen3.6-27b',
  'phi-3.5-mini-instruct':  'allam-2-7b',
  'claude-3-5-sonnet':      'openai/gpt-oss-120b',
  'gpt-4o':                 'openai/gpt-oss-120b',
};

const OPENAI_MODEL_MAP: Record<string, string> = {
  'llama-3.1-8b-instruct':  'gpt-4o-mini',
  'llama-3.1-70b-instruct': 'gpt-4o',
  'mistral-nemo-12b':       'gpt-4o-mini',
  'gemma-2-9b-it':          'gpt-4o-mini',
  'qwen2.5-7b-instruct':    'gpt-4o-mini',
  'phi-3.5-mini-instruct':  'gpt-4o-mini',
};

const STORAGE_KEY = 'cortexlab_api_key';

export function getActiveApiKey(): string {
  const local = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (local && local.trim() && local !== 'your_groq_api_key_here') {
    return local.trim();
  }
  const envGroq = import.meta.env.VITE_GROQ_API_KEY || '';
  if (envGroq && envGroq !== 'your_groq_api_key_here') {
    return envGroq.trim();
  }
  const envGemini = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (envGemini) {
    return envGemini.trim();
  }
  return '';
}

export function getActiveGeminiKey(): string {
  const local = typeof window !== 'undefined' ? localStorage.getItem('cortexlab_gemini_key') : null;
  if (local && local.trim()) return local.trim();
  return (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
}

export function getActiveGroqKey(): string {
  const local = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (local && local.startsWith('gsk_')) return local.trim();
  return (import.meta.env.VITE_GROQ_API_KEY || '').trim();
}

export function getActiveOpenAIKey(): string {
  const local = typeof window !== 'undefined' ? localStorage.getItem('cortexlab_openai_key') : null;
  if (local && local.trim()) return local.trim();
  return (import.meta.env.VITE_OPENAI_API_KEY || '').trim();
}

export function saveActiveApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key.startsWith('AQ.') || key.startsWith('AIza')) {
      localStorage.setItem('cortexlab_gemini_key', key.trim());
    } else if (key.startsWith('sk-')) {
      localStorage.setItem('cortexlab_openai_key', key.trim());
    } else {
      localStorage.setItem(STORAGE_KEY, key.trim());
    }
  }
}

export function clearActiveApiKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('cortexlab_gemini_key');
    localStorage.removeItem('cortexlab_openai_key');
  }
}

export function isKeyConfigured(): boolean {
  return getActiveApiKey().length > 5 || getActiveGeminiKey().length > 5;
}

export const isGroqConfigured = isKeyConfigured();

export function detectProvider(key: string): 'groq' | 'openai' | 'gemini' | 'unknown' {
  if (key.startsWith('gsk_')) return 'groq';
  if (key.startsWith('AQ.') || key.startsWith('AIza')) return 'gemini';
  if (key.startsWith('sk-ant-')) return 'unknown';
  if (key.startsWith('sk-')) return 'openai';
  return 'groq';
}

/**
 * Stream response from Google Gemini via SSE
 */
async function streamGeminiCompletion(
  modelName: string,
  messages: LLMMessage[],
  temperature: number,
  maxTokens: number,
  onToken: (token: string) => void,
  onDone: (fullText: string, usage: StreamUsage) => void,
  onError: (err: string) => void,
): Promise<void> {
  const geminiKey = getActiveGeminiKey() || getActiveApiKey();
  if (!geminiKey) {
    onError('NO_API_KEY');
    return;
  }

  const startMs = performance.now();
  const targetModel = modelName.includes('gemini') ? modelName : 'gemini-3.6-flash';

  // Format messages for Gemini API
  const systemMsg = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  const contents = userMessages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const payload: any = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: Math.max(maxTokens, 512),
      thinkingConfig: {
        thinkingBudget: 100,
      }
    }
  };

  if (systemMsg) {
    payload.systemInstruction = {
      parts: [{ text: systemMsg.content }]
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:streamGenerateContent?alt=sse&key=${geminiKey}`;

  try {
    let res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // If thinkingConfig isn't supported on this specific model variant, retry cleanly without it
    if (!res.ok && payload.generationConfig?.thinkingConfig) {
      delete payload.generationConfig.thinkingConfig;
      res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      onError(errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onError('Readable stream not supported');
      return;
    }

    const decoder = new TextDecoder();
    let fullText = '';
    let inputTokens = 0;
    let outputTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

      for (const line of lines) {
        const dataStr = line.slice(6).trim();
        try {
          const parsed = JSON.parse(dataStr);
          const parts = parsed.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
            if (part.text) {
              fullText += part.text;
              onToken(part.text);
            }
          }
          if (parsed.usageMetadata) {
            inputTokens = parsed.usageMetadata.promptTokenCount || inputTokens;
            outputTokens = parsed.usageMetadata.candidatesTokenCount || outputTokens;
          }
        } catch {
          // ignore parsing error for chunk
        }
      }
    }

    const totalMs = Math.round(performance.now() - startMs);
    if (outputTokens === 0) outputTokens = Math.max(1, Math.round(fullText.length / 4));
    if (inputTokens === 0) inputTokens = Math.max(1, Math.round(messages.reduce((a, m) => a + m.content.length, 0) / 4));

    onDone(fullText, { input: inputTokens, output: outputTokens, totalMs });
  } catch (err: unknown) {
    onError(err instanceof Error ? err.message : String(err));
  }
}

/**
 * Universal streaming completion dispatcher (Groq, Gemini, OpenAI)
 */
export async function streamGroqCompletion(
  modelId: string,
  messages: LLMMessage[],
  temperature: number,
  maxTokens: number,
  topP: number,
  onToken: (token: string) => void,
  onDone: (fullText: string, usage: StreamUsage) => void,
  onError: (err: string) => void,
): Promise<void> {
  // If model is Gemini or primary key is Gemini, route to Gemini
  if (modelId.startsWith('gemini') || (getActiveGeminiKey() && !getActiveGroqKey())) {
    await streamGeminiCompletion(modelId, messages, temperature, maxTokens, onToken, onDone, onError);
    return;
  }

  // Route OpenAI models directly if requested
  if (modelId === 'gpt-4o' || modelId === 'gpt-4o-mini') {
    const oaiKey = getActiveOpenAIKey();
    if (!oaiKey) {
      onError('OpenAI API key required for GPT-4o models.');
      return;
    }
    const startMs = performance.now();
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${oaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelId,
          messages,
          temperature,
          max_tokens: maxTokens,
          top_p: topP,
          stream: true,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const rawMsg = errJson?.error?.message || `HTTP ${res.status}`;
        if (rawMsg.includes('credit_balance_exhausted') || rawMsg.includes('insufficient_quota')) {
          onError('OpenAI Error: Credit balance exhausted ($0 credits). Add billing credits at platform.openai.com/settings/organization/billing or switch to Gemini / Groq for free instant inference.');
        } else {
          onError(rawMsg);
        }
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        onError('Readable stream not supported');
        return;
      }
      const decoder = new TextDecoder();
      let fullText = '';
      let inputTokens = 0;
      let outputTokens = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices?.[0]?.delta?.content ?? '';
            if (token) {
              fullText += token;
              onToken(token);
            }
          } catch {
            // ignore
          }
        }
      }
      const totalMs = Math.round(performance.now() - startMs);
      outputTokens = Math.max(1, Math.round(fullText.length / 4));
      inputTokens = Math.max(1, Math.round(messages.reduce((a, m) => a + m.content.length, 0) / 4));
      onDone(fullText, { input: inputTokens, output: outputTokens, totalMs });
      return;
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : String(err));
      return;
    }
  }

  const apiKey = getActiveGroqKey() || getActiveApiKey();
  if (!apiKey) {
    onError('NO_API_KEY');
    return;
  }

  const provider = detectProvider(apiKey);
  if (provider === 'gemini') {
    await streamGeminiCompletion(modelId, messages, temperature, maxTokens, onToken, onDone, onError);
    return;
  }

  const startMs = performance.now();
  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  const targetModel = GROQ_MODEL_MAP[modelId] ?? 'openai/gpt-oss-20b';

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: targetModel,
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        stream: true,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg = errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      onError(msg);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onError('Readable stream not supported in this browser.');
      return;
    }

    const decoder = new TextDecoder();
    let fullText = '';
    let inputTokens = 0;
    let outputTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta;
          const token = delta?.content || delta?.reasoning || '';
          if (token) {
            fullText += token;
            onToken(token);
          }
          if (parsed.usage) {
            inputTokens = parsed.usage.prompt_tokens ?? inputTokens;
            outputTokens = parsed.usage.completion_tokens ?? outputTokens;
          }
          if (parsed.x_groq?.usage) {
            inputTokens = parsed.x_groq.usage.prompt_tokens ?? inputTokens;
            outputTokens = parsed.x_groq.usage.completion_tokens ?? outputTokens;
          }
        } catch {
          // ignore chunk parse errors
        }
      }
    }

    const totalMs = Math.round(performance.now() - startMs);

    if (outputTokens === 0) {
      outputTokens = Math.max(1, Math.round(fullText.length / 4));
    }
    if (inputTokens === 0) {
      const promptChars = messages.reduce((acc, m) => acc + m.content.length, 0);
      inputTokens = Math.max(1, Math.round(promptChars / 4));
    }

    onDone(fullText, { input: inputTokens, output: outputTokens, totalMs });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    onError(errorMsg.includes('Failed to fetch') ? 'Network/CORS error connecting to API' : errorMsg);
  }
}
