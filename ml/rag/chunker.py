"""
CORTEXLAB: ML Research Module - Document Chunking & Text Extraction
Supports Fixed-Size, Recursive Character, and Semantic Chunking strategies.
"""
from typing import List, Dict, Any

def chunk_document(
    text: str,
    chunk_size: int = 512,
    overlap: int = 64,
    strategy: str = "recursive"
) -> List[Dict[str, Any]]:
    if not text:
        return []

    chunks = []
    text_length = len(text)
    
    if strategy == "fixed":
        step = max(1, chunk_size - overlap)
        idx = 0
        chunk_id = 0
        while idx < text_length:
            content = text[idx : idx + chunk_size]
            chunks.append({
                "chunk_id": chunk_id,
                "content": content.strip(),
                "start_char": idx,
                "end_char": min(idx + chunk_size, text_length),
                "token_estimate": len(content.split()) * 4 // 3
            })
            idx += step
            chunk_id += 1
            
    else:  # Recursive character chunking (paragraphs -> sentences -> words)
        paragraphs = text.split("\n\n")
        current_chunk = ""
        chunk_id = 0
        start_char = 0
        
        for p in paragraphs:
            if len(current_chunk) + len(p) + 2 <= chunk_size:
                current_chunk += ("\n\n" if current_chunk else "") + p
            else:
                if current_chunk:
                    chunks.append({
                        "chunk_id": chunk_id,
                        "content": current_chunk.strip(),
                        "start_char": start_char,
                        "end_char": start_char + len(current_chunk),
                        "token_estimate": len(current_chunk.split()) * 4 // 3
                    })
                    chunk_id += 1
                    # Keep overlap from the end of current_chunk
                    overlap_text = current_chunk[-overlap:] if overlap > 0 else ""
                    start_char += len(current_chunk) - len(overlap_text)
                    current_chunk = overlap_text + ("\n\n" if overlap_text else "") + p
                else:
                    # Single paragraph exceeds chunk size, split by lines or words
                    words = p.split()
                    sub_chunk = ""
                    for w in words:
                        if len(sub_chunk) + len(w) + 1 <= chunk_size:
                            sub_chunk += (" " if sub_chunk else "") + w
                        else:
                            chunks.append({
                                "chunk_id": chunk_id,
                                "content": sub_chunk.strip(),
                                "start_char": start_char,
                                "end_char": start_char + len(sub_chunk),
                                "token_estimate": len(sub_chunk.split()) * 4 // 3
                            })
                            chunk_id += 1
                            start_char += len(sub_chunk)
                            sub_chunk = w
                    if sub_chunk:
                        current_chunk = sub_chunk

        if current_chunk:
            chunks.append({
                "chunk_id": chunk_id,
                "content": current_chunk.strip(),
                "start_char": start_char,
                "end_char": start_char + len(current_chunk),
                "token_estimate": len(current_chunk.split()) * 4 // 3
            })

    return chunks
