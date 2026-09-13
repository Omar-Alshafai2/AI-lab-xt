import React, { useState, useEffect } from 'react';
import { ActiveView, Experiment } from './lib/types';
import { MODELS_REGISTRY, INITIAL_EXPERIMENTS } from './lib/store';
import { fetchExperimentsFromDb, saveExperimentToDb } from './lib/supabaseClient';

// Navigation Components
import { Header } from './components/navigation/Header';
import { Sidebar } from './components/navigation/Sidebar';
import { CommandPalette } from './components/navigation/CommandPalette';

// Lab Modules
import { LandingHero } from './components/landing/LandingHero';
import { DashboardOverview } from './components/overview/DashboardOverview';
import { AIPlayground } from './components/playground/AIPlayground';
import { RAGLaboratory } from './components/rag/RAGLaboratory';
import { EmbeddingLaboratory } from './components/embeddings/EmbeddingLaboratory';
import { TokenizationLab } from './components/tokenization/TokenizationLab';
import { AttentionVisualization } from './components/attention/AttentionVisualization';
import { ModelBenchmarkLab } from './components/benchmarks/ModelBenchmarkLab';
import { DatasetExplorer } from './components/datasets/DatasetExplorer';
import { ExperimentTracker } from './components/experiments/ExperimentTracker';
import { ResearchPapers } from './components/research/ResearchPapers';
import { APIExplorer } from './components/system/APIExplorer';
import { Documentation } from './components/system/Documentation';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export function App() {
  const [activeView, setActiveView] = useState<ActiveView>('landing');
  const [selectedModelId, setSelectedModelId] = useState<string>(MODELS_REGISTRY[0].id);
  const [experiments, setExperiments] = useState<Experiment[]>(INITIAL_EXPERIMENTS);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(INITIAL_EXPERIMENTS[0]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Active Model Object
  const selectedModel = MODELS_REGISTRY.find(m => m.id === selectedModelId) || MODELS_REGISTRY[0];

  // Try fetching experiments from Supabase if configured
  useEffect(() => {
    async function loadDbData() {
      const dbExps = await fetchExperimentsFromDb();
      if (dbExps && dbExps.length > 0) {
        setExperiments(dbExps);
      }
    }
    loadDbData();
  }, []);

  const handleSaveExperiment = async (newExp: Experiment) => {
    setExperiments(prev => [newExp, ...prev]);
    await saveExperimentToDb(newExp);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Global Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        openCommandPalette={() => setIsCommandPaletteOpen(true)}
        selectedModelName={selectedModel.name}
        selectedModelVram={selectedModel.vramMb}
      />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        setActiveView={setActiveView}
        onSelectModel={setSelectedModelId}
      />

      {/* Main Body */}
      {activeView === 'landing' ? (
        <main className="flex-1 flex flex-col">
          <LandingHero
            setActiveView={setActiveView}
            selectedModelId={selectedModelId}
            setSelectedModelId={setSelectedModelId}
          />
        </main>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Scientific Sidebar */}
          <Sidebar
            activeView={activeView}
            setActiveView={setActiveView}
          />

          {/* Laboratory Workspace Views */}
          <main className="flex-1 overflow-y-auto bg-[#09090B] relative">
            <ErrorBoundary fallbackView={() => setActiveView('overview')}>
            {activeView === 'overview' && (
              <DashboardOverview
                setActiveView={setActiveView}
                experiments={experiments}
                onSelectExperiment={setSelectedExperiment}
              />
            )}

            {activeView === 'playground' && (
              <AIPlayground
                selectedModelId={selectedModelId}
                onSelectModel={setSelectedModelId}
                onSaveExperiment={handleSaveExperiment}
              />
            )}

            {activeView === 'rag' && (
              <RAGLaboratory />
            )}

            {activeView === 'embeddings' && (
              <EmbeddingLaboratory />
            )}

            {activeView === 'tokenization' && (
              <TokenizationLab />
            )}

            {activeView === 'attention' && (
              <AttentionVisualization />
            )}

            {activeView === 'benchmarks' && (
              <ModelBenchmarkLab />
            )}

            {activeView === 'datasets' && (
              <DatasetExplorer />
            )}

            {(activeView === 'experiments' || activeView === 'evaluations' || activeView === 'comparisons') && (
              <ExperimentTracker
                experiments={experiments}
                selectedExperiment={selectedExperiment}
                onSelectExperiment={setSelectedExperiment}
                onAddExperiment={handleSaveExperiment}
              />
            )}

            {activeView === 'papers' && (
              <ResearchPapers
                setActiveView={setActiveView}
              />
            )}

            {activeView === 'models' && (
              <ModelBenchmarkLab />
            )}

            {activeView === 'api' && (
              <APIExplorer />
            )}

            {activeView === 'docs' && (
              <Documentation />
            )}
            </ErrorBoundary>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
