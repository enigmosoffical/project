/*
  # Admin Panel Database Schema

  1. New Tables
    - `streams`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    - `papers` (updated)
      - `id` (uuid, primary key)
      - `title` (text)
      - `stream_id` (uuid, foreign key)
      - `subject` (text)
      - `year` (integer)
      - `file_url` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create streams table
CREATE TABLE IF NOT EXISTS streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create papers table (updated schema)
CREATE TABLE IF NOT EXISTS papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  stream_id uuid REFERENCES streams(id) ON DELETE CASCADE,
  subject text NOT NULL,
  year integer NOT NULL,
  file_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;

-- Create policies for streams
CREATE POLICY "Anyone can read streams"
  ON streams
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage streams"
  ON streams
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for papers
CREATE POLICY "Anyone can read papers"
  ON papers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage papers"
  ON papers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for papers
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pyq-papers', 'pyq-papers', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy
CREATE POLICY "Anyone can view papers"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'pyq-papers');

CREATE POLICY "Authenticated users can upload papers"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'pyq-papers');

CREATE POLICY "Authenticated users can delete papers"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'pyq-papers');