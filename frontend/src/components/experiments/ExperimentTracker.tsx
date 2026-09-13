import React, { useState } from 'react';
import { 
  FlaskConical, 
  GitCompare, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Search, 
  Filter, 
  ArrowRight,
  Bot
} from 'lucide-react';
import { Experiment } from '../../lib/types';
import { streamGroqCompletion, isKeyConfigured } from '../../lib/groqClient';

interface ExperimentTrackerProps {
  experiments: Experiment[];
  selectedExperiment: Experiment | null;
  onSelectExperiment: (exp: Experiment) => void;
  onAddExperiment: (exp: Experiment) => void;
}

export const ExperimentTracker: React.FC<ExperimentTrackerProps> = ({
  experiments,
  selectedExperiment,
  onSelectExperiment,
  onAddExperiment
}) => {
  const [filterTask, setFilterTask] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [comparisonIds, setComparisonIds] = useState<string[]>(['EXP-00427', 'EXP-00428', 'EXP-00429']);
  const [showCompareMode, setShowCompareMode] = useState(false);

  const filteredExperiments = experiments.filter(e => {
    const matchesTask = filterTask === 'all' || e.taskType === filterTask;
    const matchesSearch = e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.modelName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTask && matchesSearch;
  });

  const toggleComparison = (id: string) => {
    if (comparisonIds.includes(id)) {
      setComparisonIds(comparisonIds.filter(cid => cid !== id));
    } else {
      if (comparisonIds.length < 3) {
        setComparisonIds([...comparisonIds, id]);
      } else {
        setComparisonIds([comparisonIds[1], comparisonIds[2], id]);
      }
    }
  };

  const [aiQuestion, setAiQuestion] = useState('Why did EXP-00427 outperform EXP-00428 in Faithfulness (94.2% vs 86.5%)?');
  const [aiAnswer, setAiAnswer] = useState<string>('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleRunAISynthesis = async (customQ?: string) => {
    const q = customQ || aiQuestion;
    if (!q.trim()) return;
    setIsSynthesizing(true);
    setAiAnswer('');

    const context = comparedExperiments.map(e => (
      `Experiment ${e.id} ("${e.title}"):
- Model: ${e.modelName}
- Task: ${e.taskType}
- Parameters: ${JSON.stringify(e.parameters)}
- Metrics: ${JSON.stringify(e.metrics)}`
    )).join('\n\n');

    const prompt = `You are a Principal Machine Learning Research Scientist analyzing experimental results.
Given the following experimental data:

${context}

User Question: "${q}"

Provide a mathematically rigorous, empirical explanation comparing the architectures, hyperparameters, and resulting performance trade-offs. Cite specific parameter and metric deltas.`;

    let streamed = '';
    await streamGroqCompletion(
      'gemini-3.6-flash',
      [
        { role: 'system', content: 'You are an expert ML research scientist evaluating empirical experiment ablations.' },
        { role: 'user', content: prompt }
      ],
      0.2,
      512,
      0.9,
      (token) => {
        streamed += token;
        setAiAnswer(streamed);
      },
      (full) => {
        setAiAnswer(full);
        setIsSynthesizing(false);
      },
      (err) => {
        setAiAnswer(`Error generating synthesis: ${err}. Ensure API keys are active.`);
        setIsSynthesizing(false);
      }
    );
  };

  const comparedExperiments = experiments.filter(e => comparisonIds.includes(e.id));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-mono font-bold text-[#FAFAFA] tracking-wide">
              RESEARCH EXPERIMENT TRACKER
            </h1>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-400">
              EXP-REGISTRY
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] font-sans mt-0.5">
            Log hyperparameters, benchmark ablations, compare parameter deltas, and consult the AI Research Assistant.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setShowCompareMode(!showCompareMode)}
            className={`px-3 py-1.5 rounded border flex items-center gap-1.5 transition-colors ${
              showCompareMode
                ? 'bg-cyan-500 text-black font-bold border-cyan-400'
                : 'bg-[#18181B] text-[#FAFAFA] border-[#27272A] hover:border-cyan-500/50'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            Compare Experiments ({comparisonIds.length})
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Mode (Section 13 & 15 Spec) */}
      {showCompareMode && (
        <div className="bg-[#111113] border border-cyan-500/40 rounded-lg p-5 font-mono text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#FAFAFA]">
              <GitCompare className="w-4 h-4 text-cyan-400" />
              <span>SIDE-BY-SIDE EXPERIMENT COMPARISON</span>
            </div>
            <span className="text-[11px] text-[#A1A1AA]">
              Comparing {comparedExperiments.length} experiments
            </span>
          </div>

          {/* Comparison Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#27272A] text-[#A1A1AA] text-[10px] uppercase">
                  <th className="pb-2 w-44">Hyperparameter / Metric</th>
                  {comparedExperiments.map(exp => (
                    <th key={exp.id} className="pb-2 px-3 text-cyan-400 font-bold">
                      {exp.id}
                      <span className="text-[9px] text-[#A1A1AA] block font-normal truncate max-w-[150px]">
                        {exp.title}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                <tr>
                  <td className="py-2 text-[#A1A1AA]">Model</td>
                  {comparedExperiments.map(e => (
                    <td key={e.id} className="py-2 px-3 font-semibold text-[#FAFAFA]">{e.modelName}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 text-[#A1A1AA]">Chunk Size</td>
                  {comparedExperiments.map(e => (
                    <td key={e.id} className="py-2 px-3 font-bold text-cyan-300">
                      {e.parameters.chunkSize || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 text-[#A1A1AA]">Chunk Overlap</td>
                  {comparedExperiments.map(e => (
                    <td key={e.id} className="py-2 px-3 text-[#FAFAFA]">
                      {e.parameters.overlap ?? 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 text-[#A1A1AA]">Top K</td>
                  {comparedExperiments.map(e => (
                    <td key={e.id} className="py-2 px-3 text-[#FAFAFA]">
                      {e.parameters.topK || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 text-[#A1A1AA]">Reranking</td>
                  {comparedExperiments.map(e => (
                    <td key={e.id} className="py-2 px-3 font-bold">
                      {e.parameters.reranker ? (
                        <span className="text-emerald-400">Enabled ✓</span>
                      ) : (
                        <span className="text-zinc-500">Disabled</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="bg-[#18181B]/60">
                  <td className="py-2.5 text-emerald-400 font-bold">Faithfulness</td>
                  {comparedExperiments.map(e => (
                    <td key={e.id} className="py-2.5 px-3 font-bold text-emerald-400 text-sm">
                      {e.metrics.faithfulness ? (e.metrics.faithfulness * 100).toFixed(1) + '%' : 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 text-[#A1A1AA]">Answer Relevance</td>
                  {comparedExperiments.map(e => (
                    <td key={e.id} className="py-2 px-3 font-semibold text-[#FAFAFA]">
                      {e.metrics.relevance ? (e.metrics.relevance * 100).toFixed(1) + '%' : 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 text-[#A1A1AA]">Latency</td>
                  {comparedExperiments.map(e => (
                    <td key={e.id} className="py-2 px-3 font-semibold text-cyan-400">
                      {e.metrics.latencyMs} ms
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 text-[#A1A1AA]">Throughput</td>
                  {comparedExperiments.map(e => (
                    <td key={e.id} className="py-2 px-3 text-[#FAFAFA]">
                      {e.metrics.tokensPerSec} tok/s
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* AI Research Assistant Analysis (Section 15 Spec) */}
          <div className="bg-[#09090B] border border-cyan-500/30 p-4 rounded-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27272A] pb-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <Bot className="w-4 h-4" />
                <span>AI RESEARCH ASSISTANT SYNTHESIS</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">POWERED BY LIVE LLM</span>
            </div>

            {/* Interactive Query Input */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={e => setAiQuestion(e.target.value)}
                placeholder="Ask any research question comparing these experiments..."
                className="flex-1 bg-[#111113] border border-[#27272A] focus:border-cyan-500 text-xs font-mono text-[#FAFAFA] px-3 py-1.5 rounded focus:outline-none"
              />
              <button
                onClick={() => handleRunAISynthesis()}
                disabled={isSynthesizing || !aiQuestion.trim()}
                className="px-3.5 py-1.5 rounded bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-mono font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isSynthesizing ? 'SYNTHESIZING...' : 'ANALYZE WITH AI'}
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <span className="text-[#71717A] self-center">Presets:</span>
              {[
                'Why did EXP-00427 achieve higher faithfulness?',
                'Which config gives the best latency vs accuracy trade-off?',
                'Analyze chunk size vs reranker sensitivity'
              ].map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setAiQuestion(p);
                    handleRunAISynthesis(p);
                  }}
                  className="px-2 py-0.5 rounded bg-[#18181B] border border-[#27272A] hover:border-cyan-500/50 text-[#A1A1AA] hover:text-cyan-300 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Synthesis Answer Container */}
            <div className="p-3.5 bg-[#111113] rounded border border-[#27272A] text-xs font-mono leading-relaxed">
              {aiAnswer ? (
                <div className="text-cyan-200 whitespace-pre-wrap">{aiAnswer}</div>
              ) : (
                <div className="text-[#A1A1AA] space-y-1.5 text-[11px]">
                  <p className="text-emerald-400 font-semibold">
                    Baseline Analysis: Experiment EXP-00427 achieved a +7.7% higher faithfulness score over baseline EXP-00428.
                  </p>
                  <p>The primary architectural differences were:</p>
                  <ol className="list-decimal list-inside pl-1 space-y-0.5 text-[#FAFAFA]">
                    <li><b>Chunk size increased from 256 → 512</b> (prevents sentence splitting across semantic entities).</li>
                    <li><b>Top-K increased from 3 → 5</b> (broadens candidate evidence coverage).</li>
                    <li><b>Cross-encoder reranking was enabled</b> (filters out false-positive lexical matches).</li>
                  </ol>
                  <p className="text-[10px] text-cyan-300 pt-1">
                    Empirical conclusion: The cross-encoder reranker stage accounts for ~62% of the faithfulness improvement.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111113] border border-[#27272A] p-3 rounded-lg font-mono text-xs">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-cyan-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search experiments by ID, title, or model..."
            className="w-full bg-transparent text-[#FAFAFA] placeholder-[#71717A] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#A1A1AA]" />
          <select
            value={filterTask}
            onChange={e => setFilterTask(e.target.value)}
            className="bg-[#18181B] border border-[#27272A] rounded px-2.5 py-1 text-xs text-[#FAFAFA] focus:outline-none"
          >
            <option value="all">All Task Types</option>
            <option value="rag_benchmark">RAG Benchmark</option>
            <option value="prompt_eval">Prompt Evaluation</option>
            <option value="embedding_finetune">Embedding Clustering</option>
          </select>
        </div>
      </div>

      {/* Experiment List Table (Section 13 Spec) */}
      <div className="bg-[#111113] border border-[#27272A] rounded-lg p-5 font-mono text-xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#27272A] text-[#A1A1AA] text-[10px] uppercase">
              <th className="pb-2.5">Compare</th>
              <th className="pb-2.5">Exp ID</th>
              <th className="pb-2.5">Title</th>
              <th className="pb-2.5">Task</th>
              <th className="pb-2.5">Model</th>
              <th className="pb-2.5">Faithfulness</th>
              <th className="pb-2.5">Latency</th>
              <th className="pb-2.5">Created</th>
              <th className="pb-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272A]">
            {filteredExperiments.map(exp => {
              const isComparing = comparisonIds.includes(exp.id);
              return (
                <tr key={exp.id} className="hover:bg-[#18181B] transition-colors">
                  <td className="py-3">
                    <input
                      type="checkbox"
                      checked={isComparing}
                      onChange={() => toggleComparison(exp.id)}
                      className="rounded bg-[#27272A] border-[#3F3F46] text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                  </td>
                  <td className="py-3 font-bold text-cyan-400">{exp.id}</td>
                  <td className="py-3 font-semibold text-[#FAFAFA]">{exp.title}</td>
                  <td className="py-3 text-[#A1A1AA]">
                    <span className="px-1.5 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-[10px]">
                      {exp.taskType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-[#FAFAFA]">{exp.modelName}</td>
                  <td className="py-3 font-bold text-emerald-400 tabular-nums">
                    {exp.metrics.faithfulness ? `${(exp.metrics.faithfulness * 100).toFixed(1)}%` : '—'}
                  </td>
                  <td className="py-3 font-semibold text-cyan-300 tabular-nums">
                    {exp.metrics.latencyMs} ms
                  </td>
                  <td className="py-3 text-[#71717A] text-[11px]">{exp.createdAt}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onSelectExperiment(exp)}
                      className="px-2 py-1 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-cyan-300 text-[11px] transition-colors"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
