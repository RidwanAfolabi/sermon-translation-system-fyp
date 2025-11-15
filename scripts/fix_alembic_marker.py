from pathlib import Path
import sys

# Ensure repo root is importable
REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from sqlalchemy import text
from backend.db.session import engine

with engine.begin() as conn:
    try:
        conn.execute(text("DELETE FROM alembic_version"))
        print("Removed existing alembic_version marker.")
    except Exception as e:
        print(f"Note: alembic_version not found or already empty: {e}")