-- Add title column to lessons table
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS title TEXT;

-- Update RLS if necessary (usually not needed for new columns if table-level policies exist)