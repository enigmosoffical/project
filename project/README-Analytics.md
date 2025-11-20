# Download Tracking Setup Instructions

## Overview
Full download tracking has been implemented for the SmartPYQ admin panel. Every time a user views or downloads a paper, it's tracked in the database.

## 1. Run the SQL Migration

Go to your Supabase Dashboard → SQL Editor and run this:

```sql
-- Create downloads table for tracking paper downloads
CREATE TABLE IF NOT EXISTS downloads (
  id BIGSERIAL PRIMARY KEY,
  paper_id BIGINT NOT NULL,
  user_email TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_paper FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
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
```

## 2. What Was Changed

### Repository Component (`src/components/Repository.tsx`)
- Added `trackDownload()` function that inserts a record into the downloads table
- Both "View" and "Download" buttons now trigger download tracking
- Tracks: paper_id, timestamp, and optional user_email

### Admin Panel (`src/components/AdminPanel.tsx`)
- **Analytics Dashboard** now shows:
  - **Total Downloads** - Real count from downloads table
  - **Most Popular Papers** - Top 10 papers ranked by download count
  - **Recent Activity** - Last 5 uploaded papers
  - **Papers by Stream** - Distribution chart

### Download Analytics Features:
1. **Real-time Tracking** - Every view/download is logged instantly
2. **Top Papers Ranking** - Shows most popular papers with download counts
3. **Historical Data** - All downloads are timestamped for future analysis
4. **Stream Distribution** - Visual breakdown of papers by stream

## 3. Features

### Automatically Tracks:
- Paper ID
- Download timestamp
- User email (optional - currently null, can be populated if you add user auth context)

### Analytics Dashboard Shows:
- Total download count across all papers
- Top 10 most downloaded papers with rankings
- Recent activity with timestamps
- Papers distribution by stream

## 4. Future Enhancements

You can extend this by:

1. **User Attribution**
   - Track which user downloaded what by passing user email to `trackDownload()`
   - Update Repository.tsx to pass current user's email

2. **Download History**
   - Add a "Download History" tab to show all downloads with filters
   - Export download reports as CSV

3. **Advanced Analytics**
   - Downloads per day/week/month charts
   - Peak download times
   - Subject popularity trends
   - User download patterns

4. **Download Limits**
   - Implement rate limiting (e.g., max 10 downloads per hour)
   - Premium features for unlimited downloads

## 5. Testing

1. Go to `http://localhost:5173/repository`
2. Click "View" or "Download" on any paper
3. Check console - you should see: `📊 Download tracked for: [Paper Title]`
4. Go to Admin Panel → Analytics tab
5. Refresh to see updated:
   - Total Downloads count
   - Paper in "Most Popular Papers" section

## 6. Database Queries

### View all downloads:
```sql
SELECT * FROM downloads ORDER BY downloaded_at DESC;
```

### Get download count per paper:
```sql
SELECT * FROM download_stats ORDER BY download_count DESC;
```

### Get downloads in last 24 hours:
```sql
SELECT COUNT(*) FROM downloads 
WHERE downloaded_at > NOW() - INTERVAL '24 hours';
```

### Top 10 papers this month:
```sql
SELECT 
  p.title,
  COUNT(d.id) as downloads
FROM papers p
JOIN downloads d ON p.id = d.paper_id
WHERE d.downloaded_at > DATE_TRUNC('month', NOW())
GROUP BY p.id, p.title
ORDER BY downloads DESC
LIMIT 10;
```

## Done! 🎉

Your admin panel now has a complete analytics dashboard with real-time download tracking!
