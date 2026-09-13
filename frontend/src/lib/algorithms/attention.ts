import { AttentionData } from '../types';

export const HEAD_SPECIALIZATIONS: Record<number, string> = {
  0: 'Positional Offset / Next-Token Head',
  1: 'Syntactic Dependency (Subject-Verb) Head',
  2: 'Coreference Resolution & Entity Binding Head',
  3: 'Punctuation & Delimiter Attractor Head',
  4: 'Induction Head (Sequential Pattern Matching)',
  5: 'Broad Context & Document Topic Head',
  6: 'Previous-Token Local Recurrence Head',
  7: 'Semantic Salience & Keyword Head',
  8: 'Modifier & Adjectival Binding Head',
  9: 'Anaphora & Pronoun Disambiguation Head',
  10: 'Long-Range Associative Memory Head',
  11: 'Output Logit Projection Convergence Head',
};

export function computeAttentionData(tokens: string[], layer: number = 2, head: number = 2): AttentionData {
  const n = tokens.length;
  if (n === 0) {
    return {
      tokens: [],
      layer,
      head,
      specialization: 'Empty Sequence',
      matrix: []
    };
  }

  const rawMatrix: number[][] = [];

  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    const tokI = tokens[i].toLowerCase().trim();

    for (let j = 0; j < n; j++) {
      const tokJ = tokens[j].toLowerCase().trim();
      const dist = Math.abs(i - j);
      let weight = 1.0 / (1.0 + 0.3 * dist);

      // Layer progression: earlier layers focus locally, later layers abstract
      if (layer < 3) {
        // Lower layers: local & positional attention
        if (j === i - 1 || j === i) weight += 3.5;
      } else if (layer >= 3 && layer <= 8) {
        // Mid layers: syntactic & semantic links
        if (head === 2 || head === 9) {
          // Coreference & Anaphora Head
          if (['it', 'they', 'he', 'she', 'this', 'that', 'its'].includes(tokI)) {
            if (['animal', 'dog', 'cat', 'robot', 'street', 'car', 'machine', 'system', 'transformer'].includes(tokJ)) {
              weight += 6.5;
            }
          }
        } else if (head === 1) {
          // Subject-Verb
          if (['cross', 'crossed', 'tired', 'wide', 'ran', 'compute', 'learned', 'was'].includes(tokI)) {
            if (['animal', 'agent', 'model', 'street'].includes(tokJ)) {
              weight += 5.0;
            }
          }
        } else if (head === 4) {
          // Induction head: attends to tokens that follow previous occurrences
          if (i > 3 && j < i - 1) weight += 2.8;
        }
      } else {
        // High layers: global attention & end-of-sequence aggregation
        if (j === 0 || j === n - 1) weight += 2.0;
      }

      row.push(weight);
    }
    rawMatrix.push(row);
  }

  // Softmax normalization per row
  const normMatrix: number[][] = rawMatrix.map(row => {
    const maxVal = Math.max(...row);
    const exps = row.map(v => Math.exp(v - maxVal));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    return exps.map(v => parseFloat((v / sumExps).toFixed(3)));
  });

  return {
    tokens,
    layer,
    head,
    specialization: HEAD_SPECIALIZATIONS[head] || 'Multi-Head Attention',
    matrix: normMatrix
  };
}
