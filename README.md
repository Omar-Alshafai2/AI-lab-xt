<div align="center">

# AI LAB XT

### **Interactive AI Research, Evaluation & Architecture Laboratory**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cortexlab--tan.vercel.app-06B6D4?style=for-the-badge&logo=vercel&logoColor=white)](https://cortexlab-tan.vercel.app)
[![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <a href="#-why-ai-lab-xt">Why AI LAB XT</a> â€¢
  <a href="#-interactive-laboratories">Laboratories</a> â€¢
  <a href="#-architecture">Architecture</a> â€¢
  <a href="#-tech-stack">Tech Stack</a> â€¢
  <a href="#-project-structure">Project Structure</a> â€¢
  <a href="#-quickstart">Quickstart</a> â€¢
  <a href="#-environment-variables">Environment</a> â€¢
  <a href="#-authors--acknowledgments">Acknowledgments</a>
</p>

---

</div>

## ًںŒگ Live Production Deployment

> **Experience the live suite directly in your browser â€” no installation required:**
> ًں”— **[https://cortexlab-tan.vercel.app](https://cortexlab-tan.vercel.app)**
> *(No authentication required â€” instantly explore interactive labs, attention heatmaps, and RAG diagnostics.)*

---

## ًں’، Why AI LAB XT?

Modern generative AI systems are frequently deployed as opaque black boxes. When an LLM hallucinates, a vector search retrieves irrelevant context, or attention degenerates, debugging requires inspecting the underlying mathematics and representations.

**AI LAB XT** is an interactive, browser-native research suite designed to make the internals of modern deep learning and LLM engineering tangible, visual, and quantifiable. It provides real-time telemetry, failure diagnosis, matrix inspection, and mathematical projections for engineers, researchers, and students.

---

## ًں”¬ Interactive Laboratories

### 1. ًں”چ RAG Laboratory & Failure Diagnosis
* **End-to-End Pipeline Simulation:** Ingest documents, chunk text, generate vector embeddings, execute semantic search, and synthesize answers with grounded context.
* **Failure Taxonomy Analysis:** Automatically classifies pipeline errors:
  * **Retrieval Blindspot:** Relevant information exists in raw documents but fell outside Top-K similarity thresholds.
  * **Context Dilution:** Signal lost across excessive or unranked chunks (needle-in-a-haystack degradation).
  * **Parametric Hallucination:** Model introduces non-grounded facts contradicting retrieved sources.
* **Grounding & Faithfulness Scores:** Real-time overlap and citation verification between generated answers and retrieved context passages.

---

### 2. ًں§  Multi-Head Attention Visualizer
* **Self-Attention Heatmaps:** Real-time computation and rendering of the scaled dot-product attention equation.
* **Head Specialization Inspection:** Switch across attention heads and transformer layers to examine syntactic patterns, coreference resolution, and positional decay.
* **Query-Key Interaction Tooltips:** Hover over individual token cells to inspect normalized weights and similarity scores.

---

### 3. ًںŒŒ Semantic Embedding Space (Vector Lab)
* **High-Dimensional Latent Projections:** Interactive 2D and 3D visualization of semantic space using:
  * **PCA (Principal Component Analysis):** Fast linear SVD decomposition preserving global variance.
  * **t-SNE & UMAP:** Non-linear manifold projections revealing semantic clustering.
* **Interactive Dynamic Queries:** Plot arbitrary custom tokens or sentences into the vector space and visualize Euclidean and cosine proximity in real time.

---

### 4. ًں”¤ Byte-Pair Encoding (BPE) Subword Tokenizer
* **Interactive Token Segmentation:** Step-by-step token decomposition showing how strings are partitioned into vocab IDs, subwords, and fallback byte sequences.
* **Compression Ratios & Token Economics:** Compares character length vs. token count, illustrating vocabulary efficiency and billing costs across models.
* **Color-Coded Token Boundaries:** Clear visual delineation of whitespace tokens, punctuation splits, and rare word compounds.

---

### 5. ًںژ›ï¸ڈ AI Playground & Logit Sampling Engine
* **Inference Hyperparameter Tuning:** Temperature, Top-P nucleus sampling, Top-K, and repetition penalties.
* **Provider Switcher:** Seamlessly benchmark identical prompts across **Google Gemini Flash/Pro** and **Groq (Llama-3 8B/70B)**.

---

### 6. ًں“ٹ Real-Time Telemetry & Experiment Tracker
* **Hardware & Provider Benchmarking:** Time-to-First-Token (TTFT), throughput (TPS), and end-to-end latency curves.
* **Experiment Logging:** Persist runs, system prompts, hyperparameter configurations, and evaluation metrics into **Supabase (PostgreSQL)**.

---

## ًںڈ—ï¸ڈ Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Vite + React 19 + TS)"]
        UI["AI LAB XT UI Suite"]
        Router["Client Routing & State"]
        Worker["ML Web Worker (In-Browser Math & Projections)"]
        Canvas["WebGL / 2D Canvas Engine (Attention & Vectors)"]
        UI --> Router
        Router --> Canvas
        Router --> Worker
    end

    subgraph ExternalAPIs["AI & Cloud Infrastructure"]
        Groq["Groq Cloud API (LPU Ultra-low Latency)"]
        Gemini["Google Gemini API (Multimodal Reasoning)"]
        Supa[("Supabase DB + pgvector")]
    end

    subgraph BackendAPI["Backend Service (FastAPI)"]
        API["FastAPI App Router"]
        RAG["RAG Evaluation Engine"]
        Tokenizer["BPE Tokenizer Pipeline"]
        API --> RAG
        API --> Tokenizer
    end

    UI -->|Direct Inference / Client Keys| Groq
    UI -->|Multimodal Reasoning| Gemini
    UI -->|Experiment Telemetry & Vector Store| Supa
    UI -.->|Local Proxy & Heavy Compute| API
    API --> Supa
```

---

## ًں› ï¸ڈ Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** | Modular component architecture with reactive state management |
| **Build & Tooling** | **Vite** | Ultra-fast HMR and optimized production bundling |
| **Type Safety** | **TypeScript 5.x** | Strict end-to-end interface contracts and static typing |
| **Styling & Design System** | **Tailwind CSS** | Sleek dark-mode aesthetic with custom cyan accents & glassmorphism |
| **Client-side Compute** | **Web Workers (`mlWorker.ts`)** | Off-main-thread vector math, PCA projections, and token calculations |
| **Backend & Microservices** | **Python 3.11+ / FastAPI** | High-concurrency async endpoints with Pydantic validation |
| **Database & Vector Engine** | **Supabase (PostgreSQL)** | Persistent experiment tracking and vector indexing with `pgvector` |
| **Model Acceleration** | **Groq LPU & Gemini APIs** | Low-latency LLM inference and state-of-the-art reasoning |
| **CI/CD & Hosting** | **Vercel** | Automated continuous deployment with edge performance |

---

## ًں“‚ Project Structure

```
Ai_Lab/
â”œâ”€â”€ frontend/                     # Modern React + Vite + TypeScript Application
â”‚   â”œâ”€â”€ public/                   # Static assets, SVG favicons, redirects
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ attention/        # Transformer attention matrix heatmaps
â”‚   â”‚   â”‚   â”œâ”€â”€ common/           # Error boundaries, modals, badges
â”‚   â”‚   â”‚   â”œâ”€â”€ experiments/      # Experiment tracker & metric comparisons
â”‚   â”‚   â”‚   â”œâ”€â”€ navigation/       # Command palette, responsive sidebar, top bar
â”‚   â”‚   â”‚   â”œâ”€â”€ overview/         # Dashboard telemetry & laboratory cards
â”‚   â”‚   â”‚   â”œâ”€â”€ rag/              # RAG pipeline visualizer & failure diagnostics
â”‚   â”‚   â”‚   â”œâ”€â”€ research/         # Curated research papers & citations
â”‚   â”‚   â”‚   â””â”€â”€ system/           # API explorer & documentation viewer
â”‚   â”‚   â”œâ”€â”€ lib/
â”‚   â”‚   â”‚   â”œâ”€â”€ algorithms/       # Attention math, PCA, embedding projections
â”‚   â”‚   â”‚   â”œâ”€â”€ groqClient.ts     # Groq API client integration
â”‚   â”‚   â”‚   â”œâ”€â”€ mlWorker.ts       # Web Worker for intensive client-side computation
â”‚   â”‚   â”‚   â”œâ”€â”€ store.ts          # Global state management
â”‚   â”‚   â”‚   â””â”€â”€ types.ts          # Strict TypeScript interface definitions
â”‚   â”‚   â”œâ”€â”€ App.tsx               # Primary application router & layout
â”‚   â”‚   â””â”€â”€ main.tsx              # React DOM entrypoint
â”‚   â”œâ”€â”€ package.json
â”‚   â”œâ”€â”€ tsconfig.json
â”‚   â””â”€â”€ vite.config.ts
â”‚
â”œâ”€â”€ backend/                      # High-performance FastAPI Backend Service
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ api/                  # API routers & endpoint controllers
â”‚   â”‚   â”œâ”€â”€ core/                 # App configurations & CORS handlers
â”‚   â”‚   â”œâ”€â”€ services/             # Supabase client & model proxies
â”‚   â”‚   â””â”€â”€ main.py               # FastAPI application entrypoint
â”‚   â””â”€â”€ requirements.txt          # Python dependencies
â”‚
â””â”€â”€ ml/                           # Dedicated Python ML Tooling
    â”œâ”€â”€ evaluation/
    â”‚   â””â”€â”€ rag_metrics.py        # RAG evaluation (grounding, context precision)
    â””â”€â”€ tokenization/
        â””â”€â”€ bpe_tokenizer.py      # Custom Byte-Pair Encoding subword implementation
```

---

## âڑ، Quickstart Guide

### Prerequisites
* **Node.js** (v18 or higher) & `npm`
* **Python** (v3.10 or higher) & `pip`
* Free API keys for **Supabase**, **Groq**, and **Google Gemini**

---

### 1. Clone the Repository
```bash
git clone https://github.com/Omar-Alshafai2/ai-lab-xt.git
cd ai-lab-xt
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env.local` file inside `frontend/`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GROQ_API_KEY=gsk_your_groq_api_key
VITE_GEMINI_API_KEY=AIzaSy_your_gemini_api_key
```

Run the development server:
```bash
npm run dev
```
> Open your browser to **`http://localhost:5173`** to access AI LAB XT.

---

### 3. Backend Setup (Optional)
```bash
cd ../backend
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
> Interactive Swagger API docs at **`http://localhost:8000/docs`**.

---

## ًں”گ Environment Variables

| Variable | Scope | Description | Safe for Frontend? |
| :--- | :--- | :--- | :---: |
| `VITE_SUPABASE_URL` | Frontend | Supabase project REST URL | âœ… Yes |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase public anonymous key (RLS enforced) | âœ… Yes |
| `VITE_GROQ_API_KEY` | Frontend | Groq Cloud API key for direct browser inference | âڑ ï¸ڈ Demo/Local |
| `VITE_GEMINI_API_KEY` | Frontend | Google AI Studio Gemini API key | âڑ ï¸ڈ Demo/Local |
| `SUPABASE_SERVICE_KEY` | Backend | Administrative Supabase access (bypasses RLS) | â‌Œ **NEVER** |

---

## ًں‘¨â€چًں’» Authors & Acknowledgments

* **Creator & Lead Engineer:** **[Omar Alshafai](https://github.com/Omar-Alshafai2)**
  * GitHub: [@Omar-Alshafai2](https://github.com/Omar-Alshafai2)
  * Live Suite: [https://cortexlab-tan.vercel.app](https://cortexlab-tan.vercel.app)

* **AI Pair-Programming & Systems Architecture Assistance:**
  * Built and refined with pair-programming support from **[Antigravity](https://deepmind.google/)** by the **Google DeepMind** team.

---

## ًں“„ License

This project is open-source and licensed under the **[MIT License](LICENSE)**. You are free to use, modify, and distribute it for research, educational, and commercial purposes.


