/*
  # Create PYQ Papers Table and Storage

  1. New Tables
    - `pyq_papers`
      - `id` (uuid, primary key)
      - `exam_type` (text)
      - `subject` (text)
      - `year` (integer)
      - `file_url` (text)
      - `uploaded_at` (timestamp)

  2. Storage
    - Create storage bucket for PYQ papers
    - Set up RLS policies for admin access

  3. Security
    - Enable RLS on `pyq_papers` table
    - Add policies for authenticated admin users
*/

-- Create the pyq_papers table
CREATE TABLE IF NOT EXISTS pyq_papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_type text NOT NULL,
  subject text NOT NULL,
  year integer NOT NULL,
  file_url text NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE pyq_papers ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read all papers
CREATE POLICY "Anyone can read pyq_papers"
  ON pyq_papers
  FOR SELECT
  TO public
  USING (true);

-- Create policy for authenticated users to insert papers (admin only)
CREATE POLICY "Authenticated users can insert pyq_papers"
  ON pyq_papers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create storage bucket for PYQ papers
INSERT INTO storage.buckets (id, name, public)
VALUES ('pyq-papers', 'pyq-papers', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for authenticated users to upload files
CREATE POLICY "Authenticated users can upload PYQ files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'pyq-papers');

-- Create storage policy for public read access
CREATE POLICY "Public can view PYQ files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'pyq-papers');