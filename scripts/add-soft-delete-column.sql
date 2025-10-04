-- Migration script to add soft delete functionality to logbook table
-- Run this SQL in your PostgreSQL database

-- Add deleted_at column to logbook table
ALTER TABLE logbook ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Add index for performance on deleted_at column
CREATE INDEX IF NOT EXISTS idx_logbook_deleted_at ON logbook(deleted_at);

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_logbook_magang_deleted ON logbook(magang_id, deleted_at);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'logbook' AND column_name = 'deleted_at';










