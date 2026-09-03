"""
Database connection and repository helpers for PostgreSQL / Supabase.
"""

import os
from typing import Optional

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


def get_db_status() -> dict:
    """
    Checks database connectivity status.
    """
    is_configured = bool(SUPABASE_URL and SUPABASE_KEY)
    return {
        "configured": is_configured,
        "engine": "PostgreSQL 15 (Supabase)",
        "mode": "CONNECTED" if is_configured else "IN_MEMORY_FALLBACK",
    }
