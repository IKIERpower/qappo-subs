-- Create user_categories table
CREATE TABLE IF NOT EXISTS user_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for select
CREATE POLICY "Users can view their own categories"
  ON user_categories FOR SELECT
  USING (auth.uid() = user_id);

-- Create RLS policy for insert
CREATE POLICY "Users can insert their own categories"
  ON user_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policy for delete
CREATE POLICY "Users can delete their own categories"
  ON user_categories FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policy for update
CREATE POLICY "Users can update their own categories"
  ON user_categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_categories_user_id
  ON user_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_categories_is_default
  ON user_categories(user_id, is_default);


