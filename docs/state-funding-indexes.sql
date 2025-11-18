-- Enable pg_trgm extension (PostgreSQL only)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Title & description fuzzy search
CREATE INDEX IF NOT EXISTS idx_scheme_title_trgm
  ON "StateFundingScheme"
  USING gin (lower("title") gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_scheme_description_trgm
  ON "StateFundingScheme"
  USING gin (lower("description") gin_trgm_ops);

-- Sector / tags filtering
CREATE INDEX IF NOT EXISTS idx_scheme_sector
  ON "StateFundingScheme"("sector");

CREATE INDEX IF NOT EXISTS idx_scheme_tags_trgm
  ON "StateFundingScheme"
  USING gin (lower("tags") gin_trgm_ops);

-- Funding range filtering
CREATE INDEX IF NOT EXISTS idx_scheme_funding_range
  ON "StateFundingScheme"("fundingMin", "fundingMax");

-- Popularity sorting
CREATE INDEX IF NOT EXISTS idx_scheme_popularity
  ON "StateFundingScheme"("popularityScore" DESC);

