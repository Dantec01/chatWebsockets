-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create active_users table
CREATE TABLE IF NOT EXISTS active_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_active_users_last_active ON active_users(last_active DESC);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_users ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since we don't have auth)
CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on active_users" ON active_users FOR ALL USING (true) WITH CHECK (true);
