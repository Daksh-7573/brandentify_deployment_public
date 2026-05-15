CREATE TABLE IF NOT EXISTS musk_chat_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New chat',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS musk_chat_conversations_user_updated_idx
  ON musk_chat_conversations (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS musk_chat_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES musk_chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  provider_used TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS musk_chat_messages_conversation_created_idx
  ON musk_chat_messages (conversation_id, created_at ASC);

CREATE TABLE IF NOT EXISTS musk_resume_uploads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id INTEGER REFERENCES musk_chat_conversations(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  extracted_text TEXT NOT NULL,
  ai_feedback TEXT NOT NULL,
  score INTEGER,
  provider_used TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS musk_resume_uploads_user_created_idx
  ON musk_resume_uploads (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS musk_resume_uploads_conversation_idx
  ON musk_resume_uploads (conversation_id);
