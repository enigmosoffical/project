-- Create user_roles table for role-based access control
CREATE TABLE IF NOT EXISTS user_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON user_roles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to all roles" ON user_roles;
DROP POLICY IF EXISTS "Allow authenticated user operations" ON user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Allow initial user registration" ON user_roles;
DROP POLICY IF EXISTS "Allow user self-registration" ON user_roles;
DROP POLICY IF EXISTS "Allow user updates" ON user_roles;
DROP POLICY IF EXISTS "Restrict role deletion" ON user_roles;
DROP POLICY IF EXISTS "Allow all modifications for authenticated users" ON user_roles;

-- Policy 1: Allow everyone to read all roles (needed for role checking)
CREATE POLICY "Allow read access to all roles"
ON user_roles FOR SELECT
TO public
USING (true);

-- Policy 2: Allow authenticated users full access (admin verification done in code)
CREATE POLICY "Allow authenticated user operations"
ON user_roles FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE
ON user_roles FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Note: For Supabase Auth users, you need to create accounts via:
-- 1. Supabase Dashboard → Authentication → Add User
-- 2. Or use supabase.auth.signUp() in your app
-- 3. Then roles will be synced automatically via trigger

-- For testing, manually insert admin roles for existing Supabase Auth users:
-- Replace 'user-uuid-here' with actual Supabase auth.users UUID
INSERT INTO user_roles (user_id, email, role)
VALUES 
  ('admin-uid-1', 'ayaz16318@gmail.com', 'admin'),
  ('admin-uid-2', 'buchibeemari@gmail.com', 'admin'),
  ('admin-uid-3', 'admin@buchi.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Create a trigger to auto-create user roles when Supabase Auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, email, role)
  VALUES (new.id::text, new.email, 'user')
  ON CONFLICT (email) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a view for easy role checking
CREATE OR REPLACE VIEW user_role_check AS
SELECT 
  user_id,
  email,
  role,
  CASE 
    WHEN role = 'admin' THEN true 
    ELSE false 
  END as is_admin,
  created_at
FROM user_roles;
