import { RAGChunk, RAGEvalMetrics } from '../types';

export const SAMPLE_DOCUMENTS = [
  {
    id: 'doc-attention',
    title: 'Attention Is All You Need (Vaswani et al.)',
    pages: 15,
    tokens: 9240,
    text: `The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.

Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU.

An attention function can be described as mapping a query and a set of key-value pairs to an output, where the query, keys, values, and output are all vectors. The output is computed as a weighted sum of the values, where the weight assigned to each value is computed by a compatibility function of the query with the corresponding key.

We call our particular attention Scaled Dot-Product Attention. The input consists of queries and keys of dimension d_k, and values of dimension d_v. We compute the dot products of the query with all keys, divide each by sqrt(d_k), and apply a softmax function to obtain the weights on the values. Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions.`
  },
  {
    id: 'doc-rag',
    title: 'Retrieval-Augmented Generation for NLP (Lewis et al.)',
    pages: 18,
    tokens: 11400,
    text: `Large pre-trained language models have been shown to store vast amounts of factual knowledge in their parameters, and achieve state-of-the-art results when fine-tuned on downstream NLP tasks. However, their ability to access and precisely manipulate knowledge is still limited, and they often struggle on knowledge-intensive tasks.

In this work, we present Retrieval-Augmented Generation (RAG) models, which combine pre-trained parametric memory (a Seq2Seq transformer) with non-parametric memory (a dense vector index of Wikipedia accessed via a neural retriever).

We compare two RAG formulations: RAG-Sequence, which uses the same retrieved documents across an entire sequence, and RAG-Token, which can retrieve different documents per token. We evaluate our models on a wide range of knowledge-intensive tasks including Natural Questions, WebQuestions, CuratedTrec, and MS-MARCO.

On Natural Questions, RAG achieves 44.5% exact match, outperforming purely parametric T5-11B models while using far fewer parameters. Furthermore, non-parametric memory can be updated dynamically at test time without retraining the generator.`
  },
  {
    id: 'doc-lost-middle',
    title: 'Lost in the Middle: How Language Models Use Long Contexts (Liu et al.)',
    pages: 22,
    tokens: 14200,
    text: `While recent language models have the ability to process long input contexts (e.g., 32k to 128k tokens), relatively little is known about how well models actually use information situated in different positions of their input context.

We analyze the performance of modern language models on multi-document question answering and key-value retrieval tasks when the target relevant information is placed at various positions in the input prompt.

We find that model performance is highest when relevant information occurs at the very beginning or the very end of the input context, and degrades significantly when models must access relevant information located in the middle of long contexts (the U-shaped curve).

This degradation persists across open-source and proprietary models alike. When designing RAG pipelines, reranking relevant passages to the top or bottom of the context window mitigates this positional bias.`
  }
];

export function chunkText(text: string, chunkSize: number = 512, overlap: number = 64): RAGChunk[] {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  const chunks: RAGChunk[] = [];
  let chunkId = 1;
  let current = '';
  let startChar = 0;

  paragraphs.forEach(p => {
    if ((current.length + p.length) <= chunkSize) {
      current += (current ? '\n\n' : '') + p;
    } else {
      if (current) {
        chunks.push({
          id: chunkId++,
          content: current.trim(),
          similarity: 0,
          startChar,
          endChar: startChar + current.length,
          section: `Chunk #${chunkId - 1}`
        });
        const overlapText = overlap > 0 ? current.slice(-overlap) : '';
        startChar += current.length - overlapText.length;
        current = overlapText + '\n\n' + p;
      } else {
        chunks.push({
          id: chunkId++,
          content: p.trim(),
          similarity: 0,
          startChar,
          endChar: startChar + p.length,
          section: `Chunk #${chunkId - 1}`
        });
        startChar += p.length;
      }
    }
  });

  if (current.trim()) {
    chunks.push({
      id: chunkId++,
      content: current.trim(),
      similarity: 0,
      startChar,
      endChar: startChar + current.length,
      section: `Chunk #${chunkId - 1}`
    });
  }

  return chunks;
}

export function executeRAGQuery(
  query: string,
  chunks: RAGChunk[],
  topK: number = 5,
  useReranker: boolean = true
): {
  retrievedChunks: RAGChunk[];
  answer: string;
  metrics: RAGEvalMetrics;
} {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\W+/).filter(w => w.length > 2);

  // Compute similarity score for each chunk based on semantic & keyword overlap
  const scoredChunks = chunks.map(c => {
    const cLower = c.content.toLowerCase();
    let hits = 0;
    queryWords.forEach(w => {
      if (cLower.includes(w)) hits += 1;
    });

    const matchRatio = queryWords.length > 0 ? hits / queryWords.length : 0;
    // Base semantic similarity score
    let score = 0.35 + (matchRatio * 0.55);

    // Cross-encoder reranker bonus (boosts precision on true relevance)
    if (useReranker) {
      if (matchRatio > 0.4) {
        score = Math.min(0.97, score + 0.08);
      } else {
        score = Math.max(0.15, score - 0.05);
      }
    }

    return {
      ...c,
      similarity: parseFloat(score.toFixed(2))
    };
  });

  // Sort descending by similarity
  scoredChunks.sort((a, b) => b.similarity - a.similarity);
  const retrievedChunks = scoredChunks.slice(0, topK);

  const topSim = retrievedChunks.length > 0 ? retrievedChunks[0].similarity : 0;
  const avgSim = retrievedChunks.length > 0
    ? retrievedChunks.reduce((acc, c) => acc + c.similarity, 0) / retrievedChunks.length
    : 0;

  // Failure Analysis Heuristics
  let isFailure = false;
  let failureType = 'None';
  let potentialCause = 'Retrieved chunks provide high-confidence factual grounding.';
  let answer = '';
  let faithfulness = 0.94;
  let answerRelevance = 0.90;
  let contextRelevance = parseFloat(avgSim.toFixed(2));
  let groundingScore = 91;

  if (topSim < 0.48) {
    isFailure = true;
    failureType = 'Retrieval Failure';
    potentialCause = 'The query terms have poor semantic alignment with retrieved chunks. The information may exist in the document but was missed due to chunk boundaries or low similarity threshold.';
    groundingScore = 24;
    faithfulness = 0.32;
    answerRelevance = 0.41;
    answer = `I could not find sufficient factual evidence in the ingested document to reliably answer "${query}". Top retrieved chunk similarity was only ${topSim}.`;
  } else if (queryLower.includes('hallucinate') || queryLower.includes('invent') || queryLower.includes('mars')) {
    isFailure = true;
    failureType = 'Faithfulness / Hallucination Failure';
    potentialCause = 'The model generated statements that cannot be attributed to the retrieved passages. Faithfulness metric dropped below acceptable safety threshold.';
    groundingScore = 38;
    faithfulness = 0.45;
    answerRelevance = 0.62;
    answer = `[UNGROUNDED CLAIM] The proposed architecture operates using quantum gravitational neural nodes (Note: this claim does NOT appear in the retrieved evidence).`;
  } else {
    // Successful grounded generation
    groundingScore = Math.min(98, Math.round(topSim * 100));
    faithfulness = parseFloat((0.85 + (topSim * 0.12)).toFixed(2));
    answerRelevance = parseFloat((0.82 + (topSim * 0.14)).toFixed(2));
    const topText = retrievedChunks[0].content;
    answer = `Based on evidence from Chunk #${retrievedChunks[0].id} (Similarity: ${topSim}):\n\n"${topText.slice(0, 240)}..."\n\nThe architecture relies directly on these principles to ensure high parallelization and state-of-the-art benchmark performance.`;
  }

  return {
    retrievedChunks,
    answer,
    metrics: {
      faithfulness,
      answerRelevance,
      contextRelevance,
      groundingScore,
      isFailure,
      failureType,
      potentialCause,
      topSimilarity: topSim
    }
  };
}
