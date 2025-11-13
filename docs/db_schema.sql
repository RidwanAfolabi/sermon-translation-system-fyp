-- ============================================================================
-- GitHub SQL Configuration File
-- ============================================================================
-- This file contains SQL queries and database operations that will be used
-- for managing and interacting with GitHub-related data, such as repositories,
-- issues, pull requests, commits, or user information.
--
-- Purpose: Centralized location for GitHub data operations including:
--   - Data retrieval and analysis
--   - Database schema definitions
--   - Query templates for GitHub API data
--   - Reporting and analytics operations
--
-- Note: Update queries as needed based on your specific GitHub integration
-- requirements and database schema.
-- ============================================================================
-- docs/db_schema.sql
-- Basic schema for sermons, segments and logs

CREATE TABLE IF NOT EXISTS sermons (
    sermon_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    speaker VARCHAR(150),
    date_uploaded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(32) DEFAULT 'draft' -- draft, translated, vetted, ready
);

CREATE TABLE IF NOT EXISTS segments (
    segment_id SERIAL PRIMARY KEY,
    sermon_id INTEGER NOT NULL REFERENCES sermons(sermon_id) ON DELETE CASCADE,
    segment_order INTEGER NOT NULL,
    malay_text TEXT NOT NULL,
    english_text TEXT,
    confidence_score FLOAT,
    is_vetted BOOLEAN DEFAULT false,
    last_reviewed_by VARCHAR(150),
    last_reviewed_date TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs (
    log_id SERIAL PRIMARY KEY,
    sermon_id INTEGER NOT NULL REFERENCES sermons(sermon_id) ON DELETE CASCADE,
    segment_id INTEGER REFERENCES segments(segment_id) ON DELETE SET NULL,
    session_id VARCHAR(100),
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    alignment_confidence FLOAT,
    display_time_seconds FLOAT,
    flag VARCHAR(32)
);
