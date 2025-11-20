-- Create downloads table for tracking paper downloads
CREATE TABLE IF NOT EXISTS downloads (
  id BIGSERIAL PRIMARY KEY,
  paper_id BIGINT NOT NULL,
  user_email TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_paper FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_downloads_paper_id ON downloads(paper_id);
CREATE INDEX IF NOT EXISTS idx_downloads_downloaded_at ON downloads(downloaded_at DESC);

-- Enable Row Level Security
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (track downloads)
CREATE POLICY "Allow public download tracking"
ON downloads FOR INSERT
TO public
WITH CHECK (true);

-- Allow public reads
CREATE POLICY "Allow public download reads"
ON downloads FOR SELECT
TO public
USING (true);

-- Create a view for download statistics
CREATE OR REPLACE VIEW download_stats AS
SELECT 
  p.id as paper_id,
  p.title as paper_title,
  COUNT(d.id) as download_count,
  MAX(d.downloaded_at) as last_downloaded
FROM papers p
LEFT JOIN downloads d ON p.id = d.paper_id
GROUP BY p.id, p.title;
