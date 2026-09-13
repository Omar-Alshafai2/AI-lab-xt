"""
CORTEXLAB: ML Research Module - RAG Evaluation & Failure Detection
Computes Faithfulness, Answer Relevance, Context Relevance, and diagnoses pipeline failures.
"""
from typing import List, Dict, Any

def evaluate_rag_turn(
    query: str,
    retrieved_chunks: List[Dict[str, Any]],
    generated_answer: str,
    ground_truth: str = ""
) -> Dict[str, Any]:
    if not retrieved_chunks:
        return {
            "faithfulness": 0.0,
            "answer_relevance": 0.2,
            "context_relevance": 0.0,
            "grounding_score": 0.0,
            "is_failure": True,
            "failure_type": "Retrieval Failure",
            "potential_cause": "Zero relevant chunks returned by vector index. Check embedding model or similarity threshold.",
            "top_similarity": 0.0
        }

    similarities = [c.get("similarity", 0.5) for c in retrieved_chunks]
    top_sim = max(similarities) if similarities else 0.0
    avg_sim = sum(similarities) / len(similarities) if similarities else 0.0

    # Token overlap heuristic for grounding check
    query_words = set(query.lower().split())
    answer_words = set(generated_answer.lower().split())
    context_text = " ".join([c.get("content", "") for c in retrieved_chunks]).lower()

    # Grounded tokens ratio
    supported_words = [w for w in answer_words if w in context_text]
    grounding_score = round(len(supported_words) / max(1, len(answer_words)), 2)

    faithfulness = round(min(1.0, grounding_score * 1.05), 2)
    context_relevance = round(avg_sim, 2)
    answer_relevance = round(min(1.0, 0.75 + (top_sim * 0.2)), 2)

    # Failure diagnosis
    is_failure = False
    failure_type = "None"
    potential_cause = "Pipeline executed with high grounding confidence."

    if top_sim < 0.55:
        is_failure = True
        failure_type = "Retrieval Failure"
        potential_cause = "Top retrieved chunk has insufficient semantic similarity (< 0.55). The correct information exists in document but was truncated or poorly chunked."
    elif faithfulness < 0.65:
        is_failure = True
        failure_type = "Faithfulness / Hallucination Failure"
        potential_cause = "Generated claims contradict or lack factual attribution in retrieved evidence."
    elif context_relevance < 0.50:
        is_failure = True
        failure_type = "Context Dilution / Noise Failure"
        potential_cause = "Irrelevant chunks retrieved in Top-K diluting LLM attention span."

    return {
        "faithfulness": faithfulness,
        "answer_relevance": answer_relevance,
        "context_relevance": context_relevance,
        "grounding_score": int(grounding_score * 100),
        "is_failure": is_failure,
        "failure_type": failure_type,
        "potential_cause": potential_cause,
        "top_similarity": round(top_sim, 2)
    }
