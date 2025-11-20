/*
  # Dynamic Field Management System for Educational Admin Panel

  1. New Tables
    - `field_types` - Configurable field categories (Program, Branch, Year, etc.)
    - `field_values` - Actual values for each field type (CSE, ECE, 1st Year, etc.)
    - `field_hierarchies` - Define parent-child relationships between fields
    - `subjects` - Enhanced subjects table with dynamic field associations
    - `subject_field_mappings` - Many-to-many relationship between subjects and field values
    - `paper_field_mappings` - Associate papers with multiple field combinations

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage data
    - Public read access for field data

  3. Features
    - Flexible hierarchical field structures
    - Dynamic subject management
    - Bulk operations support
    - Data validation and integrity
*/

-- Field Types table (Program, Branch, Year, etc.)
CREATE TABLE IF NOT EXISTS field_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  display_order integer DEFAULT 0,
  is_required boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Field Values table (CSE, ECE, 1st Year, etc.)
CREATE TABLE IF NOT EXISTS field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_type_id uuid REFERENCES field_types(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(field_type_id, name)
);

-- Field Hierarchies table (define parent-child relationships)
CREATE TABLE IF NOT EXISTS field_hierarchies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_field_type_id uuid REFERENCES field_types(id) ON DELETE CASCADE,
  child_field_type_id uuid REFERENCES field_types(id) ON DELETE CASCADE,
  is_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_field_type_id, child_field_type_id)
);

-- Enhanced subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE,
  description text,
  credits integer,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subject-Field mappings (many-to-many)
CREATE TABLE IF NOT EXISTS subject_field_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  field_value_id uuid REFERENCES field_values(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(subject_id, field_value_id)
);

-- Enhanced PYQ papers table with dynamic fields
DROP TABLE IF EXISTS pyq_papers;
CREATE TABLE IF NOT EXISTS pyq_papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject_id uuid REFERENCES subjects(id),
  year integer NOT NULL,
  file_url text NOT NULL,
  file_size bigint,
  difficulty_level text CHECK (difficulty_level IN ('Easy', 'Medium', 'Hard')),
  tags text[] DEFAULT '{}',
  download_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  uploaded_by uuid,
  uploaded_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Paper-Field mappings (many-to-many)
CREATE TABLE IF NOT EXISTS paper_field_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid REFERENCES pyq_papers(id) ON DELETE CASCADE,
  field_value_id uuid REFERENCES field_values(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(paper_id, field_value_id)
);

-- Enable RLS on all tables
ALTER TABLE field_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_hierarchies ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_field_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pyq_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_field_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for field_types
CREATE POLICY "Anyone can read field_types"
  ON field_types
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage field_types"
  ON field_types
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for field_values
CREATE POLICY "Anyone can read field_values"
  ON field_values
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage field_values"
  ON field_values
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for field_hierarchies
CREATE POLICY "Anyone can read field_hierarchies"
  ON field_hierarchies
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage field_hierarchies"
  ON field_hierarchies
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for subjects
CREATE POLICY "Anyone can read subjects"
  ON subjects
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage subjects"
  ON subjects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for subject_field_mappings
CREATE POLICY "Anyone can read subject_field_mappings"
  ON subject_field_mappings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage subject_field_mappings"
  ON subject_field_mappings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for pyq_papers
CREATE POLICY "Anyone can read pyq_papers"
  ON pyq_papers
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage pyq_papers"
  ON pyq_papers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for paper_field_mappings
CREATE POLICY "Anyone can read paper_field_mappings"
  ON paper_field_mappings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage paper_field_mappings"
  ON paper_field_mappings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default field types
INSERT INTO field_types (name, description, display_order, is_required) VALUES
  ('Program Type', 'Academic program level (Diploma, Bachelor, Master, etc.)', 1, true),
  ('Branch', 'Academic department or branch (CSE, ECE, Mechanical, etc.)', 2, true),
  ('Year', 'Academic year or semester', 3, true),
  ('Specialization', 'Area of specialization or concentration', 4, false),
  ('Institution', 'Educational institution or university', 5, false)
ON CONFLICT (name) DO NOTHING;

-- Insert default field values
DO $$
DECLARE
  program_type_id uuid;
  branch_id uuid;
  year_id uuid;
  specialization_id uuid;
  institution_id uuid;
BEGIN
  -- Get field type IDs
  SELECT id INTO program_type_id FROM field_types WHERE name = 'Program Type';
  SELECT id INTO branch_id FROM field_types WHERE name = 'Branch';
  SELECT id INTO year_id FROM field_types WHERE name = 'Year';
  SELECT id INTO specialization_id FROM field_types WHERE name = 'Specialization';
  SELECT id INTO institution_id FROM field_types WHERE name = 'Institution';

  -- Insert Program Types
  INSERT INTO field_values (field_type_id, name, code, display_order) VALUES
    (program_type_id, 'Diploma', 'DIP', 1),
    (program_type_id, 'Bachelor of Technology', 'B.Tech', 2),
    (program_type_id, 'Bachelor of Engineering', 'B.E.', 3),
    (program_type_id, 'Master of Technology', 'M.Tech', 4),
    (program_type_id, 'Master of Engineering', 'M.E.', 5),
    (program_type_id, 'Bachelor of Science', 'B.Sc', 6),
    (program_type_id, 'Master of Science', 'M.Sc', 7)
  ON CONFLICT (field_type_id, name) DO NOTHING;

  -- Insert Branches
  INSERT INTO field_values (field_type_id, name, code, display_order) VALUES
    (branch_id, 'Computer Science Engineering', 'CSE', 1),
    (branch_id, 'Electronics & Communication Engineering', 'ECE', 2),
    (branch_id, 'Mechanical Engineering', 'ME', 3),
    (branch_id, 'Electrical Engineering', 'EE', 4),
    (branch_id, 'Civil Engineering', 'CE', 5),
    (branch_id, 'Information Technology', 'IT', 6),
    (branch_id, 'Chemical Engineering', 'CHE', 7),
    (branch_id, 'Aerospace Engineering', 'AE', 8)
  ON CONFLICT (field_type_id, name) DO NOTHING;

  -- Insert Years
  INSERT INTO field_values (field_type_id, name, code, display_order) VALUES
    (year_id, '1st Year', '1', 1),
    (year_id, '2nd Year', '2', 2),
    (year_id, '3rd Year', '3', 3),
    (year_id, '4th Year', '4', 4),
    (year_id, '1st Semester', 'S1', 5),
    (year_id, '2nd Semester', 'S2', 6),
    (year_id, '3rd Semester', 'S3', 7),
    (year_id, '4th Semester', 'S4', 8),
    (year_id, '5th Semester', 'S5', 9),
    (year_id, '6th Semester', 'S6', 10),
    (year_id, '7th Semester', 'S7', 11),
    (year_id, '8th Semester', 'S8', 12)
  ON CONFLICT (field_type_id, name) DO NOTHING;

  -- Insert Specializations
  INSERT INTO field_values (field_type_id, name, code, display_order) VALUES
    (specialization_id, 'Artificial Intelligence', 'AI', 1),
    (specialization_id, 'Machine Learning', 'ML', 2),
    (specialization_id, 'Data Science', 'DS', 3),
    (specialization_id, 'Cyber Security', 'CS', 4),
    (specialization_id, 'Software Engineering', 'SE', 5),
    (specialization_id, 'VLSI Design', 'VLSI', 6),
    (specialization_id, 'Embedded Systems', 'ES', 7),
    (specialization_id, 'Power Systems', 'PS', 8),
    (specialization_id, 'Structural Engineering', 'ST', 9),
    (specialization_id, 'Thermal Engineering', 'TE', 10)
  ON CONFLICT (field_type_id, name) DO NOTHING;
END $$;

-- Insert default field hierarchies
DO $$
DECLARE
  program_type_id uuid;
  branch_id uuid;
  year_id uuid;
  specialization_id uuid;
BEGIN
  SELECT id INTO program_type_id FROM field_types WHERE name = 'Program Type';
  SELECT id INTO branch_id FROM field_types WHERE name = 'Branch';
  SELECT id INTO year_id FROM field_types WHERE name = 'Year';
  SELECT id INTO specialization_id FROM field_types WHERE name = 'Specialization';

  -- Define hierarchy: Program Type → Branch → Year → Specialization
  INSERT INTO field_hierarchies (parent_field_type_id, child_field_type_id, is_required) VALUES
    (program_type_id, branch_id, true),
    (branch_id, year_id, true),
    (year_id, specialization_id, false)
  ON CONFLICT (parent_field_type_id, child_field_type_id) DO NOTHING;
END $$;

-- Insert sample subjects
DO $$
DECLARE
  cse_id uuid;
  ece_id uuid;
  me_id uuid;
  first_year_id uuid;
  second_year_id uuid;
BEGIN
  -- Get field value IDs
  SELECT fv.id INTO cse_id 
  FROM field_values fv 
  JOIN field_types ft ON fv.field_type_id = ft.id 
  WHERE ft.name = 'Branch' AND fv.name = 'Computer Science Engineering';
  
  SELECT fv.id INTO ece_id 
  FROM field_values fv 
  JOIN field_types ft ON fv.field_type_id = ft.id 
  WHERE ft.name = 'Branch' AND fv.name = 'Electronics & Communication Engineering';
  
  SELECT fv.id INTO me_id 
  FROM field_values fv 
  JOIN field_types ft ON fv.field_type_id = ft.id 
  WHERE ft.name = 'Branch' AND fv.name = 'Mechanical Engineering';
  
  SELECT fv.id INTO first_year_id 
  FROM field_values fv 
  JOIN field_types ft ON fv.field_type_id = ft.id 
  WHERE ft.name = 'Year' AND fv.name = '1st Year';
  
  SELECT fv.id INTO second_year_id 
  FROM field_values fv 
  JOIN field_types ft ON fv.field_type_id = ft.id 
  WHERE ft.name = 'Year' AND fv.name = '2nd Year';

  -- Insert subjects
  INSERT INTO subjects (name, code, description, credits) VALUES
    ('Data Structures and Algorithms', 'CS201', 'Fundamental data structures and algorithmic techniques', 4),
    ('Database Management Systems', 'CS301', 'Design and implementation of database systems', 3),
    ('Computer Networks', 'CS401', 'Network protocols and distributed systems', 3),
    ('Digital Signal Processing', 'EC301', 'Processing of digital signals and systems', 4),
    ('Microprocessors and Microcontrollers', 'EC201', 'Architecture and programming of microprocessors', 3),
    ('Thermodynamics', 'ME201', 'Laws of thermodynamics and their applications', 3),
    ('Fluid Mechanics', 'ME301', 'Behavior of fluids in motion and at rest', 4),
    ('Mathematics I', 'MA101', 'Calculus and linear algebra fundamentals', 4),
    ('Physics I', 'PH101', 'Mechanics and wave motion', 3),
    ('Engineering Graphics', 'EG101', 'Technical drawing and CAD fundamentals', 2)
  ON CONFLICT (code) DO NOTHING;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_field_values_field_type_id ON field_values(field_type_id);
CREATE INDEX IF NOT EXISTS idx_field_values_active ON field_values(is_active);
CREATE INDEX IF NOT EXISTS idx_subject_field_mappings_subject_id ON subject_field_mappings(subject_id);
CREATE INDEX IF NOT EXISTS idx_subject_field_mappings_field_value_id ON subject_field_mappings(field_value_id);
CREATE INDEX IF NOT EXISTS idx_paper_field_mappings_paper_id ON paper_field_mappings(paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_field_mappings_field_value_id ON paper_field_mappings(field_value_id);
CREATE INDEX IF NOT EXISTS idx_pyq_papers_subject_id ON pyq_papers(subject_id);
CREATE INDEX IF NOT EXISTS idx_pyq_papers_year ON pyq_papers(year);
CREATE INDEX IF NOT EXISTS idx_pyq_papers_active ON pyq_papers(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_field_types_updated_at BEFORE UPDATE ON field_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_field_values_updated_at BEFORE UPDATE ON field_values FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pyq_papers_updated_at BEFORE UPDATE ON pyq_papers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();