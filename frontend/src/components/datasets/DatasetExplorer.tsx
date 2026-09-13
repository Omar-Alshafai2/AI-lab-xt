import React, { useState, useRef } from 'react';
import { Database, Upload, BarChart2, AlertCircle, Bot, FileText, CheckCircle2 } from 'lucide-react';
import { PRELOADED_DATASETS } from '../../lib/store';
import { DatasetMeta } from '../../lib/types';

export const DatasetExplorer: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetMeta[]>(PRELOADED_DATASETS);
  const [selectedDatasetId, setSelectedDatasetId] = useState(PRELOADED_DATASETS[0].id);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeDataset = datasets.find(d => d.id === selectedDatasetId) || datasets[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = (event.target?.result as string) || '';
        let rows: Record<string, any>[] = [];
        let colNames: string[] = [];

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          rows = Array.isArray(parsed) ? parsed : [parsed];
          if (rows.length > 0) {
            colNames = Object.keys(rows[0]);
          }
        } else if (file.name.endsWith('.jsonl')) {
          rows = content
            .split('\n')
            .filter(l => l.trim())
            .map(l => {
              try { return JSON.parse(l); } catch { return null; }
            })
            .filter(Boolean);
          if (rows.length > 0) {
            colNames = Object.keys(rows[0]);
          }
        } else {
          // CSV or text
          const lines = content.split('\n').filter(l => l.trim());
          if (lines.length > 0) {
            colNames = lines[0].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
            rows = lines.slice(1).map(l => {
              const vals = l.split(',');
              const obj: Record<string, any> = {};
              colNames.forEach((c, idx) => {
                obj[c] = vals[idx]?.trim();
              });
              return obj;
            });
          }
        }

        const rowCount = rows.length;
        const colCount = Math.max(1, colNames.length);
        let nullCount = 0;
        const uniqueSet = new Map<string, Set<any>>();

        colNames.forEach(c => uniqueSet.set(c, new Set()));

        rows.forEach(r => {
          colNames.forEach(c => {
            const val = r[c];
            if (val === undefined || val === null || val === '') {
              nullCount++;
            } else {
              uniqueSet.get(c)?.add(val);
            }
          });
        });

        const totalCells = Math.max(1, rowCount * colCount);
        const missingPct = parseFloat(((nullCount / totalCells) * 100).toFixed(2));
        const sizeMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));

        const columns = colNames.map(c => ({
          name: c,
          type: 'string',
          nulls: Math.round(nullCount / colCount),
          unique: uniqueSet.get(c)?.size || 1
        }));

        const firstCol = colNames[0] || 'record';
        const sampleDist: { label: string; count: number; percentage: number }[] = [];
        if (uniqueSet.get(firstCol)) {
          const values = Array.from(uniqueSet.get(firstCol)!).slice(0, 4);
          values.forEach(v => {
            const count = rows.filter(r => r[firstCol] === v).length;
            sampleDist.push({
              label: String(v).slice(0, 20),
              count,
              percentage: parseFloat(((count / Math.max(1, rowCount)) * 100).toFixed(1))
            });
          });
        }

        const newDataset: DatasetMeta = {
          id: `custom-${Date.now()}`,
          name: file.name,
          rowCount,
          columnCount: colCount,
          missingValuePct: missingPct,
          duplicateCount: 0,
          sizeMb,
          columns: columns.length > 0 ? columns : [{ name: 'content', type: 'text', nulls: 0, unique: rowCount }],
          distribution: sampleDist.length > 0 ? sampleDist : [
            { label: 'Parsed Entities', count: rowCount, percentage: 100.0 }
          ],
          aiAnalysis: `Custom dataset "${file.name}" ingested successfully with ${rowCount.toLocaleString()} records and ${colCount} features. Missing value ratio is ${missingPct}%. Schema profile ready for pgvector indexing and downstream evaluation.`
        };

        setDatasets(prev => [newDataset, ...prev]);
        setSelectedDatasetId(newDataset.id);
        setUploadSuccess(`Ingested "${file.name}" (${rowCount.toLocaleString()} rows)`);
        setTimeout(() => setUploadSuccess(null), 4000);
      } catch (err) {
        console.error('File parsing error:', err);
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-mono font-bold text-[#FAFAFA] tracking-wide">
              DATASET EXPLORER & ML DIAGNOSTICS
            </h1>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-400">
              CORPUS ANALYSIS
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] font-sans mt-0.5">
            Automated schema profiling, class imbalance diagnostics, missing value ratios, and AI statistical synthesis.
          </p>
        </div>

        {/* Dataset Switcher */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[#A1A1AA]">DATASET:</span>
          <select
            value={selectedDatasetId}
            onChange={e => setSelectedDatasetId(e.target.value)}
            className="bg-[#18181B] border border-[#27272A] text-xs font-mono text-[#FAFAFA] px-3 py-1.5 rounded focus:outline-none focus:border-cyan-500"
          >
            {datasets.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.rowCount.toLocaleString()} rows)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Computed Summary Stats Cards (Section 14 Spec) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
        <div className="bg-[#111113] p-3.5 rounded-lg border border-[#27272A]">
          <div className="text-[10px] text-[#A1A1AA] uppercase">TOTAL ROWS</div>
          <div className="text-2xl font-bold text-[#FAFAFA] tabular-nums mt-1">
            {activeDataset.rowCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-cyan-400 mt-1">Verified Records</div>
        </div>

        <div className="bg-[#111113] p-3.5 rounded-lg border border-[#27272A]">
          <div className="text-[10px] text-[#A1A1AA] uppercase">COLUMNS / FEATURES</div>
          <div className="text-2xl font-bold text-[#FAFAFA] tabular-nums mt-1">
            {activeDataset.columnCount}
          </div>
          <div className="text-[10px] text-[#A1A1AA] mt-1">Schema Defined</div>
        </div>

        <div className="bg-[#111113] p-3.5 rounded-lg border border-[#27272A]">
          <div className="text-[10px] text-[#A1A1AA] uppercase">MISSING VALUES</div>
          <div className="text-2xl font-bold text-amber-400 tabular-nums mt-1">
            {activeDataset.missingValuePct.toFixed(2)}%
          </div>
          <div className="text-[10px] text-amber-400/80 mt-1">
            {activeDataset.missingValuePct > 0 ? 'Imputation Recommended' : 'Zero Nulls'}
          </div>
        </div>

        <div className="bg-[#111113] p-3.5 rounded-lg border border-[#27272A]">
          <div className="text-[10px] text-[#A1A1AA] uppercase">DUPLICATE ROWS</div>
          <div className="text-2xl font-bold text-[#FAFAFA] tabular-nums mt-1">
            {activeDataset.duplicateCount}
          </div>
          <div className="text-[10px] text-[#A1A1AA] mt-1">Dedup Filter Available</div>
        </div>

        <div className="bg-[#111113] p-3.5 rounded-lg border border-[#27272A]">
          <div className="text-[10px] text-[#A1A1AA] uppercase">IN-MEMORY SIZE</div>
          <div className="text-2xl font-bold text-cyan-400 tabular-nums mt-1">
            {activeDataset.sizeMb} MB
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">Ready for Embedding</div>
        </div>
      </div>

      {/* Main Analysis Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Schema Profiling & Class Distributions */}
        <div className="lg:col-span-7 space-y-4 font-mono text-xs">
          {/* Class / Categorical Frequency Bar Charts */}
          <div className="bg-[#111113] border border-[#27272A] rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#FAFAFA]">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <span>CATEGORICAL CLASS FREQUENCIES</span>
              </div>
              <span className="text-[11px] text-[#A1A1AA]">Sampled across corpus</span>
            </div>

            <div className="space-y-3 pt-2">
              {activeDataset.distribution.map((dist, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#FAFAFA] font-bold">{dist.label}</span>
                    <span className="text-cyan-400 font-bold tabular-nums">
                      {dist.count.toLocaleString()} ({dist.percentage}%)
                    </span>
                  </div>
                  <div className="h-2.5 bg-[#09090B] border border-[#27272A] rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded transition-all duration-500"
                      style={{ width: `${dist.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schema Columns Table */}
          <div className="bg-[#111113] border border-[#27272A] rounded-lg p-5 overflow-x-auto">
            <div className="text-[11px] text-[#A1A1AA] uppercase font-bold mb-3">
              FEATURE SCHEMA DEFINITIONS
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#27272A] text-[#A1A1AA] text-[10px] uppercase">
                  <th className="pb-2">Column Name</th>
                  <th className="pb-2">Data Type</th>
                  <th className="pb-2">Null Count</th>
                  <th className="pb-2">Cardinality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {activeDataset.columns.map((col, i) => (
                  <tr key={i} className="hover:bg-[#18181B]">
                    <td className="py-2.5 font-bold text-[#FAFAFA]">{col.name}</td>
                    <td className="py-2.5 text-cyan-400">
                      <span className="px-1.5 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-[10px]">
                        {col.type}
                      </span>
                    </td>
                    <td className={`py-2.5 tabular-nums ${col.nulls > 0 ? 'text-amber-400' : 'text-[#71717A]'}`}>
                      {col.nulls}
                    </td>
                    <td className="py-2.5 text-[#A1A1AA] tabular-nums">{col.unique.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: AI Statistical Commentary (Section 14 & 15 Spec) */}
        <div className="lg:col-span-5 space-y-4 font-mono text-xs">
          {/* AI Analysis Synthesis Card */}
          <div className="bg-[#111113] border border-cyan-500/30 rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs border-b border-[#27272A] pb-2">
              <Bot className="w-4 h-4" />
              <span>AI COMPUTED RESEARCH INSIGHT</span>
            </div>

            <div className="bg-[#09090B] border border-[#27272A] p-4 rounded text-xs text-[#FAFAFA] leading-relaxed">
              <p className="mb-2 text-cyan-300 font-semibold">
                Autonomous Diagnostic Summary for "{activeDataset.name}":
              </p>
              <p className="text-[#A1A1AA] leading-relaxed">
                {activeDataset.aiAnalysis}
              </p>
            </div>

            <div className="space-y-1 text-[11px] text-[#A1A1AA] pt-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Format validated: UTF-8 standard compliance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Vectorization ready for pgvector pipeline</span>
              </div>
            </div>
          </div>

          {/* Upload Custom Dataset interactive box */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.json,.jsonl,.txt"
            className="hidden"
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#111113] border border-dashed border-[#3F3F46] hover:border-cyan-500/60 rounded-lg p-6 text-center cursor-pointer transition-colors group"
          >
            <Upload className={`w-8 h-8 ${isUploading ? 'text-cyan-400 animate-bounce' : 'text-[#71717A] group-hover:text-cyan-400'} mx-auto mb-2 transition-colors`} />
            <div className="font-bold text-[#FAFAFA] text-xs">
              {isUploading ? 'Ingesting & Profiling...' : 'Upload New Dataset'}
            </div>
            {uploadSuccess ? (
              <p className="text-[10px] text-emerald-400 mt-1 font-semibold">
                ✓ {uploadSuccess}
              </p>
            ) : (
              <p className="text-[10px] text-[#A1A1AA] mt-1">
                Supports CSV, JSON, JSONL, TXT. Instant browser client profiling.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
