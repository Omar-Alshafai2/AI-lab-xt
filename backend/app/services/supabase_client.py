import os
from typing import Optional
from backend.app.core.config import settings

_supabase_client = None

def get_supabase():
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client
    
    url = settings.SUPABASE_URL or os.getenv("SUPABASE_URL")
    key = settings.SUPABASE_KEY or os.getenv("SUPABASE_ANON_KEY")
    
    if url and key:
        try:
            from supabase import create_client
            _supabase_client = create_client(url, key)
            return _supabase_client
        except Exception as e:
            print(f"[Supabase] Could not connect: {e}")
            return None
    return None
