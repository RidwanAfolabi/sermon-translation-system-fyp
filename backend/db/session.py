"""
backend/db/session.py
---------------------
Handles database engine and session setup using SQLAlchemy.
Automatically loads environment variables from .env for local/dev usage.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv  # 👈 added import

# ---------------------------------------------------------------------
# Load environment variables
# ---------------------------------------------------------------------
# This ensures DATABASE_URL and other keys are available to SQLAlchemy
load_dotenv()

# ---------------------------------------------------------------------
# Database Configuration
# ---------------------------------------------------------------------
DB_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://sermon_admin:secret@localhost:5432/sermon_translation",
)

# ---------------------------------------------------------------------
# SQLAlchemy Engine & Session Factory
# ---------------------------------------------------------------------
engine = create_engine(DB_URL, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

# ---------------------------------------------------------------------
# Declarative Base for Models
# ---------------------------------------------------------------------
Base = declarative_base()
