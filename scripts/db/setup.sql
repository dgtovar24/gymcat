-- ============================================================================
-- Gymcat Database Setup
-- Extensions required: PostGIS (geo), pgvector (embeddings), uuid-ossp
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify extensions
SELECT extname, extversion FROM pg_extension
WHERE extname IN ('postgis', 'vector', 'uuid-ossp');
