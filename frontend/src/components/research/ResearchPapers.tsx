import React from 'react';
import { FileText, ArrowRight, ExternalLink, BookOpen, Layers, Eye } from 'lucide-react';
import { ActiveView } from '../../lib/types';

interface ResearchPapersProps {
  setActiveView: (view: ActiveView) => void;
}

const PAPERS = [
  {
    id: 'attention-paper',
    title: 'Attention Is All You Need',
    authors: 'Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin',
    venue: 'NeurIPS 2017 • Google Brain & Google Research',
    citations: '130,000+',
    abstract: 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.',
    takeaways: [
      'Introduces Scaled Dot-Product Attention: Softmax(QK^T / sqrt(d_k)) * V.',
      'Replaces O(n) sequential recurrent steps with O(1) sequential operations, allowing massive GPU parallelism.',
      'Multi-Head Attention enables the model to simultaneously attend to different representation subspaces.'
    ],
    targetLab: 'attention' as ActiveView
  },
  {
    id: 'rag-paper',
    title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
    authors: 'Lewis, Perez, Piktus, Petroni, Karpukhin, Goyal, Küttler, Lewis, Yih, Rocktäschel, Riedel, Kiela',
    venue: 'NeurIPS 2020 • Facebook AI Research (FAIR)',
    citations: '4,800+',
    abstract: 'We explore RAG models which combine pre-trained parametric and non-parametric memory for language generation. We compare two RAG formulations: RAG-Sequence and RAG-Token, outperforming purely parametric models on Open-Domain QA while allowing test-time knowledge updates without retraining.',
    takeaways: [
      'Combines non-parametric dense vector index (Wikipedia / pgvector) with pre-trained Seq2Seq transformer.',
      'Allows dynamic fact updates without expensive foundation model retraining.',
      'Reduces hallucination by grounding generation on top-K retrieved evidence passages.'
    ],
    targetLab: 'rag' as ActiveView
  },
  {
    id: 'lost-in-middle',
    title: 'Lost in the Middle: How Language Models Use Long Contexts',
    authors: 'Liu, Lin, Hewitt, Paranjape, Bevilacqua, Petroni, Liang',
    venue: 'TACL 2024 • Stanford University',
    citations: '1,200+',
    abstract: 'We analyze the performance of modern language models when relevant information is placed at various positions in the input prompt. We discover a U-shaped performance curve: performance is highest at the beginning or end of context and degrades dramatically when key information is situated in the middle.',
    takeaways: [
      'Empirical discovery of the U-shaped attention degradation curve in long contexts.',
      'Models suffer up to 40% retrieval degradation when needles are buried in the middle 50% of context.',
      'Re-ranking retrieved passages to place high-confidence chunks at top and bottom directly counters this effect.'
    ],
    targetLab: 'rag' as ActiveView
  }
];

export const ResearchPapers: React.FC<ResearchPapersProps> = ({ setActiveView }) => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-mono font-bold text-[#FAFAFA] tracking-wide">
              RESEARCH PAPERS & FOUNDATIONAL STUDIES
            </h1>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-400">
              LITERATURE WALKTHROUGH
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] font-sans mt-0.5">
            Key machine learning publications reproduced and experimentally accessible inside CortexLab.
          </p>
        </div>
      </div>

      {/* Papers Grid */}
      <div className="space-y-6">
        {PAPERS.map(paper => (
          <div
            key={paper.id}
            className="bg-[#111113] border border-[#27272A] rounded-lg p-6 font-mono text-xs space-y-4 hover:border-cyan-500/40 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#27272A] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#FAFAFA] mb-1">
                  {paper.title}
                </h2>
                <div className="text-[11px] text-[#A1A1AA]">
                  {paper.authors}
                </div>
                <div className="text-[10px] text-cyan-400 mt-0.5">
                  {paper.venue} • {paper.citations} Citations
                </div>
              </div>

              <button
                onClick={() => setActiveView(paper.targetLab)}
                className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
              >
                Launch in Lab
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Abstract */}
            <div>
              <div className="text-[10px] text-[#A1A1AA] uppercase font-bold mb-1">ABSTRACT</div>
              <p className="text-[#FAFAFA] bg-[#09090B] p-3 rounded border border-[#27272A] leading-relaxed text-[11px]">
                "{paper.abstract}"
              </p>
            </div>

            {/* Key Takeaways */}
            <div>
              <div className="text-[10px] text-[#A1A1AA] uppercase font-bold mb-1.5">
                KEY ARCHITECTURAL TAKEAWAYS
              </div>
              <ul className="space-y-1 text-[11px] text-[#A1A1AA]">
                {paper.takeaways.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
