# CORTEXLAB: Interactive AI Systems Research Laboratory

An interactive, scientific-grade laboratory for understanding, evaluating, and experimenting with modern AI and machine learning systems.

```
CORTEXLAB
│
┌───────────────┼────────────────┐
│               │                │
AI Playground   RAG Lab          Model Lab
│               │                │
LLM testing     Documents        Models
Prompting       Retrieval        Inference
Tokens          Embeddings       Benchmarking
Parameters      Reranking        Evaluation
│               │                │
└───────────────┼────────────────┘
│
Research Lab
│
Experiments / Results
```

---

## Key Modules

1. **🧪 AI Playground & Inference Telemetry**:
   - Model selection (Llama 3.1 8B, Llama 3.1 70B, Mistral NeMo 12B, Gemma 2 9B, Claude 3.5 Sonnet, GPT-4o).
   - Real-time inference metrics: **Latency (ms)**, **Time to First Token (TTFT)**, **Input/Output Tokens**, **Throughput (Tokens/s)**, **Estimated Cost ($)**, and **VRAM Memory Footprint**.
   - Hyperparameters: Temperature sampling, Top-P, Max Tokens, System Prompts.

2. **🔬 RAG Laboratory & Failure Analysis (Signature Feature)**:
   - Visualized Pipeline: `PDF/Doc -> Parsing -> Chunking (42 chunks) -> Embedding (BGE-Large) -> Retrieval (Top-K) -> Generation`.
   - Chunk boundary configurator: Chunk sizes (128, 256, 512, 1024), Overlap (0, 32, 64, 128).
   - Cross-encoder reranking toggle with precision deltas.
   - **Root-Cause Failure Diagnostics**:
     - Automatically flags `Retrieval Failure`, `Context Noise`, and `Hallucination / Faithfulness Failure`.
     - Displays Grounding Score meter (e.g. 91%), individual chunk similarity scores, and tri-metrics (Faithfulness, Answer Relevance, Context Relevance).

3. **🧠 Embedding Laboratory (2D & 3D Manifolds)**:
   - Real-time dimensionality reduction: **PCA**, **t-SNE**, **UMAP**.
   - Interactive 2D Canvas and 3D WebGL (Three.js) orbital point clouds.
   - Inspector panel: Document ID, text excerpt, 384-dimensional vector preview, and cosine nearest neighbors.

4. **🔤 Tokenization Lab**:
   - Subword BPE decomposition with distinct scientific token pill badges.
   - Token IDs mapping, UTF-8 byte stream, and hex dumps (`0x54 0x72 0x61 ...`).
   - Side-by-side tokenizer comparison: **Llama 3 (128k BPE)** vs **GPT-4o (100k)** vs **BERT (30k WordPiece)**.
   - Metrics: Characters, Words, Tokens, Token/Word ratio, Compression ratio.

5. **👁️ Transformer Attention Visualization**:
   - Self-attention matrix heatmap $A = \text{softmax}(QK^T / \sqrt{d})$ with cell hover weights.
   - Bipartite attention arcs illustrating dynamic token coreference (e.g. "it" connecting to "animal" vs "street").
   - Layer selector (0 to 11) and Attention Head selector with behavioral tags (Syntactic Head, Coreference Head, Induction Head, Positional Offset Head).

6. **📊 Model Benchmark Laboratory**:
   - Empirical model comparison matrix: Latency, Tokens/s, VRAM, Context Window, MMLU, GSM8K, HumanEval, RAG Faithfulness, Cost.
   - Interactive bar distributions and simulated benchmark suite runner.

7. **🧪 Research Experiment Tracking & Comparison**:
   - Experiment logs (`EXP-00427`, `EXP-00428`, `EXP-00429`...).
   - Side-by-side experiment diff viewer comparing parameter changes and metric deltas.
   - **AI Research Assistant Synthesis**: Explains why experiments outperformed baselines referencing computed numbers.

8. **📚 Dataset Explorer & ML Diagnostics**:
   - Automatic schema profiling: Row count, Columns, Missing value %, Duplicate count, In-memory size.
   - Categorical class distribution bar charts.
   - Automated AI research commentary on dataset skew and token length distributions.

---

## Tech Stack & Architecture

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Three.js
- **Database**: Supabase PostgreSQL + `pgvector`
- **Backend**: Python 3.12 + FastAPI + Scikit-learn + NumPy
- **Styling**: Scientific dark mode palette (`#09090B`, `#111113`, `#27272A`, cyan `#06B6D4`, JetBrains Mono monospace figures)

---

## Quickstart

### 1. Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Supabase Database Setup
1. Open your Supabase project dashboard at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor**.
3. Run `supabase/schema.sql` to enable the `vector` extension and create tables.
4. Run `supabase/seed.sql` to populate sample experiments and benchmarks.
5. (Optional) Set environment variables in `frontend/.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
   *(CortexLab automatically uses persistent local fallback if Supabase credentials are not yet entered).*

### 3. Python FastAPI Backend (Optional)
```bash
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```
