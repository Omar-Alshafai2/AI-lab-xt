import { TokenBreakdown } from '../types';

const TOKEN_COLORS = [
  'bg-cyan-950/60 text-cyan-300 border-cyan-800/60 hover:border-cyan-500',
  'bg-emerald-950/60 text-emerald-300 border-emerald-800/60 hover:border-emerald-500',
  'bg-amber-950/60 text-amber-300 border-amber-800/60 hover:border-amber-500',
  'bg-blue-950/60 text-blue-300 border-blue-800/60 hover:border-blue-500',
  'bg-purple-950/60 text-purple-300 border-purple-800/60 hover:border-purple-500',
  'bg-rose-950/60 text-rose-300 border-rose-800/60 hover:border-rose-500',
];

export function runTokenizer(text: string, tokenizerType: 'llama3' | 'gpt4o' | 'bert' = 'llama3') {
  if (!text) {
    return {
      tokens: [] as TokenBreakdown[],
      tokenIds: [] as number[],
      stats: {
        characters: 0,
        words: 0,
        tokens: 0,
        tokenToWordRatio: 0,
        bytesPerToken: 0,
      }
    };
  }

  // Realistic regex token splits
  let rawSplits: string[] = [];
  
  if (tokenizerType === 'bert') {
    // WordPiece style: preserves ## for continuations
    const words = text.match(/\w+|[^\w\s]|\s+/g) || [text];
    rawSplits = [];
    words.forEach(w => {
      if (w.length > 5 && /\w/.test(w)) {
        rawSplits.push(w.slice(0, 3));
        rawSplits.push('##' + w.slice(3));
      } else {
        rawSplits.push(w);
      }
    });
  } else {
    // Byte-Pair Encoding (BPE) subword splits
    // Recognizes contractions, spaces, sub-words
    const bpeRegex = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+/gu;
    const matches = text.match(bpeRegex);
    if (matches && matches.length > 0) {
      rawSplits = matches;
    } else {
      // Fallback
      rawSplits = text.match(/\S+|\s+/g) || [text];
    }
  }

  const tokens: TokenBreakdown[] = rawSplits.map((tok, i) => {
    // Deterministic pseudo-ID based on string content
    let hash = 0;
    for (let j = 0; j < tok.length; j++) {
      hash = (hash << 5) - hash + tok.charCodeAt(j);
      hash |= 0;
    }
    const offset = tokenizerType === 'llama3' ? 128000 : tokenizerType === 'gpt4o' ? 100000 : 30522;
    const id = Math.abs(hash) % offset;

    // Byte array and Hex strings
    const encoder = new TextEncoder();
    const bytes = Array.from(encoder.encode(tok)).map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0'));

    return {
      token: tok,
      id,
      bytes,
      color: TOKEN_COLORS[i % TOKEN_COLORS.length]
    };
  });

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const characters = text.length;
  const tokenCount = tokens.length;
  const tokenToWordRatio = words > 0 ? parseFloat((tokenCount / words).toFixed(2)) : 0;
  const totalBytes = new TextEncoder().encode(text).length;
  const bytesPerToken = tokenCount > 0 ? parseFloat((totalBytes / tokenCount).toFixed(2)) : 0;

  return {
    tokens,
    tokenIds: tokens.map(t => t.id),
    stats: {
      characters,
      words,
      tokens: tokenCount,
      tokenToWordRatio,
      bytesPerToken
    }
  };
}
