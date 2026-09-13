import React, { useState } from 'react';
import { Eye, Layers, Compass, Sliders, Info, Sparkles, Check } from 'lucide-react';
import { computeAttentionData, HEAD_SPECIALIZATIONS } from '../../lib/algorithms/attention';

const SAMPLE_SENTENCES = [
  {
    title: 'Winograd Schema (Tired Animal)',
    text: 'The animal didn\'t cross the street because it was tired.'
  },
  {
    title: 'Winograd Schema (Wide Street)',
    text: 'The animal didn\'t cross the street because it was too wide.'
  },
  {
    title: 'Transformer Mechanics',
    text: 'Transformers compute attention weights by multiplying queries and keys.'
  }
];

export const AttentionVisualization: React.FC = () => {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [inputText, setInputText] = useState(SAMPLE_SENTENCES[0].text);
  const [layer, setLayer] = useState(5); // Mid-layer
  const [head, setHead] = useState(2); // Coreference head
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number | null>(7); // 'it'
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number; weight: number } | null>(null);

  // Split sentence into words/tokens
  const tokens = inputText.match(/\w+|[^\w\s]/g) || ['The', 'model'];

  const attentionData = computeAttentionData(tokens, layer, head);

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIdx(idx);
    setInputText(SAMPLE_SENTENCES[idx].text);
    // Find index of 'it' or set to 0
    const words: string[] = (SAMPLE_SENTENCES[idx].text.match(/\w+|[^\w\s]/g) || []) as string[];
    const itIdx = words.findIndex((w: string) => w.toLowerCase() === 'it');
    setSelectedTokenIdx(itIdx >= 0 ? itIdx : 0);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-mono font-bold text-[#FAFAFA] tracking-wide">
              TRANSFORMER ATTENTION VISUALIZATION
            </h1>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-400">
              MULTI-HEAD MECHANISM
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] font-sans mt-0.5">
            Inspect self-attention weights A = softmax(QK^T / √d), head specializations, and coreference resolution.
          </p>
        </div>

        {/* Head Specialization readout */}
        <div className="px-3 py-1.5 rounded bg-[#111113] border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>{attentionData.specialization}</span>
        </div>
      </div>

      {/* Preset selection bar */}
      <div className="flex flex-wrap gap-2 items-center text-xs font-mono">
        <span className="text-[#71717A] text-[11px] uppercase mr-1">Winograd Presets:</span>
        {SAMPLE_SENTENCES.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSelectPreset(i)}
            className={`px-3 py-1 rounded border text-[11px] transition-colors ${
              selectedPresetIdx === i
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold'
                : 'bg-[#111113] border-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA]'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Input & Layer / Head Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-[#111113] border border-[#27272A] p-4 rounded-lg font-mono text-xs">
        <div className="lg:col-span-6">
          <label className="text-[10px] text-[#A1A1AA] uppercase font-bold block mb-1">
            INPUT SEQUENCE
          </label>
          <input
            type="text"
            value={inputText}
            onChange={e => {
              setInputText(e.target.value);
              setSelectedTokenIdx(0);
            }}
            className="w-full bg-[#18181B] border border-[#27272A] text-xs font-mono text-[#FAFAFA] px-3 py-1.5 rounded focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Layer Selector (0 to 11) */}
        <div className="lg:col-span-3">
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-[#A1A1AA]">Layer:</span>
            <span className="text-cyan-400 font-bold">Layer {layer} / 11</span>
          </div>
          <input
            type="range"
            min="0"
            max="11"
            value={layer}
            onChange={e => setLayer(parseInt(e.target.value))}
            className="w-full accent-cyan-400 bg-[#27272A] h-1.5 rounded cursor-pointer"
          />
        </div>

        {/* Head Selector (0 to 11) */}
        <div className="lg:col-span-3">
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-[#A1A1AA]">Head:</span>
            <span className="text-cyan-400 font-bold">Head {head} / 11</span>
          </div>
          <input
            type="range"
            min="0"
            max="11"
            value={head}
            onChange={e => setHead(parseInt(e.target.value))}
            className="w-full accent-cyan-400 bg-[#27272A] h-1.5 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Main Grid: Interactive Bipartite Token View & Attention Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Token Interaction & Distribution Arcs */}
        <div className="lg:col-span-5 bg-[#111113] border border-[#27272A] rounded-lg p-5 font-mono text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-2 text-[11px] text-[#A1A1AA] uppercase font-bold">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>TOKEN ATTENTION ALLOCATION</span>
            </div>
            <span className="text-cyan-300">
              Query: {selectedTokenIdx !== null && tokens[selectedTokenIdx] ? `"${tokens[selectedTokenIdx]}"` : 'None'}
            </span>
          </div>

          <p className="text-[11px] text-[#A1A1AA]">
            Click any token below to observe how attention weights disperse across antecedent candidates:
          </p>

          {/* Interactive Token Pills */}
          <div className="flex flex-wrap gap-1.5 p-3 bg-[#09090B] border border-[#27272A] rounded">
            {tokens.map((tok, i) => {
              const isSelected = selectedTokenIdx === i;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedTokenIdx(i)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-black font-bold ring-2 ring-cyan-400'
                      : 'bg-[#18181B] text-[#FAFAFA] border border-[#27272A] hover:border-cyan-500/50'
                  }`}
                >
                  {tok}
                </button>
              );
            })}
          </div>

          {/* Attention Weights Breakdown from Selected Token */}
          {selectedTokenIdx !== null && attentionData.matrix[selectedTokenIdx] && (
            <div className="space-y-2 pt-2">
              <div className="text-[10px] text-[#A1A1AA] uppercase font-bold">
                ATTENTION TARGETS FROM "{tokens[selectedTokenIdx]}"
              </div>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {tokens.map((targetTok, targetIdx) => {
                  const weight = attentionData.matrix[selectedTokenIdx][targetIdx] || 0;
                  const isHigh = weight > 0.15;
                  return (
                    <div
                      key={targetIdx}
                      className={`p-2 rounded border flex items-center justify-between text-xs ${
                        isHigh ? 'bg-cyan-950/20 border-cyan-500/40 text-cyan-200' : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[#71717A] text-[10px] w-4">#{targetIdx}</span>
                        <span className="font-bold text-[#FAFAFA]">{targetTok}</span>
                      </div>
                      <div className="flex items-center gap-3 w-40">
                        <div className="flex-1 bg-[#27272A] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isHigh ? 'bg-cyan-400' : 'bg-[#71717A]'
                            }`}
                            style={{ width: `${Math.min(100, weight * 100 * 2.5)}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-[11px] tabular-nums font-semibold w-10 text-right">
                          {weight.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Full Self-Attention Matrix Heatmap (Section 11 Spec) */}
        <div className="lg:col-span-7 bg-[#111113] border border-[#27272A] rounded-lg p-5 font-mono text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-2 text-[11px] text-[#A1A1AA] uppercase font-bold">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>SELF-ATTENTION MATRIX $A_{"{i,j}"}$</span>
            </div>
            {hoveredCell ? (
              <span className="text-cyan-400">
                A[{tokens[hoveredCell.row]} → {tokens[hoveredCell.col]}] = {hoveredCell.weight.toFixed(3)}
              </span>
            ) : (
              <span className="text-[10px] text-[#71717A]">Hover cell to inspect $A_{"{i,j}"}$</span>
            )}
          </div>

          {/* Matrix Grid */}
          <div className="overflow-x-auto p-2 bg-[#09090B] border border-[#27272A] rounded">
            <div className="inline-block min-w-full">
              {/* Header row with token names */}
              <div className="flex items-center mb-1">
                <div className="w-16 shrink-0"></div>
                {tokens.map((tok, j) => (
                  <div
                    key={j}
                    className="w-8 shrink-0 text-[9px] text-[#A1A1AA] text-center truncate font-bold"
                    title={tok}
                  >
                    {tok.slice(0, 3)}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {tokens.map((tokI, i) => (
                <div key={i} className="flex items-center mb-1">
                  {/* Row label */}
                  <div
                    className={`w-16 shrink-0 text-[10px] truncate text-right pr-2 font-bold ${
                      selectedTokenIdx === i ? 'text-cyan-400' : 'text-[#A1A1AA]'
                    }`}
                    title={tokI}
                  >
                    {tokI}
                  </div>

                  {/* Matrix Cells */}
                  {tokens.map((tokJ, j) => {
                    const weight = attentionData.matrix[i]?.[j] || 0;
                    // Intensity color calculation
                    const opacity = Math.min(1.0, weight * 2.8);
                    return (
                      <div
                        key={j}
                        onMouseEnter={() => setHoveredCell({ row: i, col: j, weight })}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => setSelectedTokenIdx(i)}
                        className="w-8 h-7 shrink-0 border border-[#27272A] rounded-sm flex items-center justify-center cursor-pointer transition-all hover:border-cyan-400"
                        style={{
                          backgroundColor: `rgba(6, 182, 212, ${Math.max(0.04, opacity)})`,
                        }}
                        title={`${tokI} attends to ${tokJ}: ${weight.toFixed(3)}`}
                      >
                        {weight > 0.12 && (
                          <span className="text-[8px] font-mono text-[#FAFAFA] font-bold">
                            {weight.toFixed(2).slice(1)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Matrix Footnote */}
          <div className="flex items-center justify-between text-[11px] text-[#71717A] pt-1">
            <span>Rows: Query Tokens ($Q$)</span>
            <span>Columns: Key Tokens ($K$)</span>
            <span>Scale: Softmax(QK^T / √d_k)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
