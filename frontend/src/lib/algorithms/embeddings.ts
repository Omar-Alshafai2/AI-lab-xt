import { EmbeddingPoint } from '../types';

export const SAMPLE_EMBEDDING_DATA: { id: number; title: string; category: 'ai' | 'tech' | 'science' | 'sports'; text: string; baseVec: number[] }[] = [
  // AI & ML
  { id: 1, title: 'Attention Is All You Need', category: 'ai', text: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...', baseVec: [0.92, 0.88, 0.12, -0.05, 0.74, 0.31] },
  { id: 2, title: 'BERT: Pre-training of Deep Bidirectional Transformers', category: 'ai', text: 'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations...', baseVec: [0.89, 0.85, 0.15, -0.02, 0.71, 0.28] },
  { id: 3, title: 'Llama 3 Architecture Report', category: 'ai', text: 'Dense auto-regressive transformer scaled with 15T tokens with grouped-query attention and RoPE...', baseVec: [0.94, 0.91, 0.08, 0.01, 0.79, 0.35] },
  { id: 4, title: 'Retrieval-Augmented Generation for NLP', category: 'ai', text: 'We explore RAG models which combine pre-trained parametric and non-parametric memory for language generation...', baseVec: [0.86, 0.82, 0.21, 0.04, 0.68, 0.40] },
  { id: 5, title: 'Direct Preference Optimization (DPO)', category: 'ai', text: 'We show how to optimize language models from human preferences without reinforcement learning by directly solving a classification task...', baseVec: [0.88, 0.84, 0.18, -0.01, 0.72, 0.33] },
  { id: 6, title: 'FlashAttention-2: Faster Attention with Better Work Partitioning', category: 'ai', text: 'We present FlashAttention-2, an algorithm to compute exact attention with fewer memory reads/writes and optimized GPU hardware tiling...', baseVec: [0.91, 0.87, 0.10, 0.03, 0.76, 0.29] },

  // Science & Quantum
  { id: 7, title: 'Quantum Teleportation Across 100km Fiber', category: 'science', text: 'Experimental demonstration of continuous-variable quantum state teleportation over deployed telecommunication networks...', baseVec: [-0.32, 0.21, 0.89, 0.82, 0.11, -0.42] },
  { id: 8, title: 'CRISPR-Cas9 Epigenetic Editing in Vivo', category: 'science', text: 'Targeted DNA methylation and transcriptional repression mediated by catalytic dead Cas9 fusion complexes in mammalian tissues...', baseVec: [-0.41, 0.15, 0.94, 0.79, 0.05, -0.38] },
  { id: 9, title: 'Superconducting Qubits Decoherence Time', category: 'science', text: 'Mitigation of dielectric loss at metal-air interfaces in high-coherence transmon quantum circuits operating at millikelvin temperatures...', baseVec: [-0.28, 0.25, 0.87, 0.85, 0.14, -0.45] },
  { id: 10, title: 'AlphaFold Protein Structure Database', category: 'science', text: 'High-accuracy biomolecular 3D structural predictions spanning the human proteome derived from deep neural contact maps...', baseVec: [0.15, 0.52, 0.81, 0.65, 0.42, -0.15] },

  // Technology & Cloud
  { id: 11, title: 'Linux eBPF Kernel Observability at Scale', category: 'tech', text: 'Sandboxed bytecode verification and high-frequency tracing in modern cloud-native hypervisors for zero-overhead packet routing...', baseVec: [0.22, -0.72, -0.45, 0.21, -0.65, 0.81] },
  { id: 12, title: 'Distributed Raft Consensus in Distributed DBs', category: 'tech', text: 'Leader election, multi-paxos log compaction, and deterministic state machine replication across multi-region datacenters...', baseVec: [0.18, -0.68, -0.51, 0.25, -0.60, 0.78] },
  { id: 13, title: 'NVMe-over-Fabrics Storage Virtualization', category: 'tech', text: 'Zero-copy RDMA network protocols for sub-microsecond block storage virtualization across disaggregated compute clusters...', baseVec: [0.25, -0.75, -0.42, 0.18, -0.69, 0.84] },
  { id: 14, title: 'PostgreSQL pgvector Query Acceleration', category: 'tech', text: 'Hierarchical Navigable Small World (HNSW) graphs and inverted file flat indexing inside relational database engines...', baseVec: [0.45, -0.42, -0.28, 0.12, -0.30, 0.72] },

  // Sports & Athletics
  { id: 15, title: 'Aerodynamics of Modern Formula 1 Ground Effects', category: 'sports', text: 'Computational fluid dynamics of venturi underfloor tunnels and vortex generation under high-speed transient yaw angles...', baseVec: [-0.75, -0.32, -0.68, -0.85, 0.12, 0.22] },
  { id: 16, title: 'Kinematic Analysis of Olympic Sprint Biomechanics', category: 'sports', text: 'High-speed optical tracking of ground reaction force vectors and pelvic rotation frequencies in elite 100m sprinters...', baseVec: [-0.82, -0.28, -0.71, -0.89, 0.08, 0.18] },
  { id: 17, title: 'VO2 Max Thresholds in Elite Endurance Cyclists', category: 'sports', text: 'Lactate threshold accumulation and mitochondrial enzymatic adaptations during grand tour multi-stage road cycling races...', baseVec: [-0.78, -0.35, -0.64, -0.82, 0.15, 0.25] },
  { id: 18, title: 'Tennis Racket String Tension and Spin Ballistics', category: 'sports', text: 'Coefficient of restitution and angular momentum imparted to pressurized felt tennis spheres under modern polyester monofilament configurations...', baseVec: [-0.71, -0.39, -0.61, -0.78, 0.19, 0.21] },
];

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function projectEmbeddings(algorithm: 'pca' | 'tsne' | 'umap' = 'pca'): EmbeddingPoint[] {
  // Category cluster offsets for realistic projection separation
  const clusterOffsets = {
    ai: { x2: 45, y2: 45, x3: 40, y3: 40, z3: 35 },
    science: { x2: -45, y2: 40, x3: -40, y3: 35, z3: -35 },
    tech: { x2: 40, y2: -45, x3: 35, y3: -40, z3: -30 },
    sports: { x2: -45, y2: -45, x3: -45, y3: -45, z3: 40 },
  };

  const points: EmbeddingPoint[] = SAMPLE_EMBEDDING_DATA.map(item => {
    const offset = clusterOffsets[item.category];
    const v = item.baseVec;

    // Projection calculation
    let x2 = 0, y2 = 0, x3 = 0, y3 = 0, z3 = 0;

    if (algorithm === 'pca') {
      // Principal Component 1 & 2
      x2 = offset.x2 + v[0] * 25 + v[1] * 10;
      y2 = offset.y2 + v[2] * 25 + v[3] * 10;
      x3 = offset.x3 + v[0] * 20;
      y3 = offset.y3 + v[2] * 20;
      z3 = offset.z3 + v[4] * 20;
    } else if (algorithm === 'tsne') {
      // t-SNE tight clustering
      x2 = offset.x2 * 1.1 + v[0] * 15;
      y2 = offset.y2 * 1.1 + v[1] * 15;
      x3 = offset.x3 * 1.1 + v[0] * 12;
      y3 = offset.y3 * 1.1 + v[2] * 12;
      z3 = offset.z3 * 1.1 + v[5] * 12;
    } else {
      // UMAP topological manifold
      x2 = offset.x2 * 0.95 + v[1] * 22;
      y2 = offset.y2 * 0.95 + v[4] * 22;
      x3 = offset.x3 * 0.95 + v[1] * 18;
      y3 = offset.y3 * 0.95 + v[3] * 18;
      z3 = offset.z3 * 0.95 + v[5] * 18;
    }

    // High dimensional vector representation (384-dim truncated preview)
    const fullVector = [
      ...v,
      parseFloat((v[0] * 0.42).toFixed(3)),
      parseFloat((-v[1] * 0.58).toFixed(3)),
      parseFloat((v[2] * 0.31).toFixed(3)),
      parseFloat((-v[3] * 0.72).toFixed(3)),
    ];

    return {
      id: item.id,
      title: item.title,
      category: item.category,
      text: item.text,
      vector: fullVector,
      x2d: parseFloat(x2.toFixed(1)),
      y2d: parseFloat(y2.toFixed(1)),
      x3d: parseFloat(x3.toFixed(1)),
      y3d: parseFloat(y3.toFixed(1)),
      z3d: parseFloat(z3.toFixed(1)),
    };
  });

  // Calculate nearest neighbors for each point
  points.forEach(p => {
    const scores = points
      .filter(other => other.id !== p.id)
      .map(other => ({
        id: other.id,
        title: other.title,
        similarity: parseFloat(cosineSimilarity(p.vector, other.vector).toFixed(3))
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 4);
    p.nearestNeighbors = scores;
  });

  return points;
}
