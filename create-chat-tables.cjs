/**
 * Migration script to create the chat messaging system tables
 */
const { Pool } = require('pg');

async function executeQuery(queryText, params = []) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const result = await pool.query(queryText, params);
    return result;
  } catch (error) {
    console.error(`Error executing query: ${queryText}`, error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function createTables() {
  // Create conversations table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      is_group BOOLEAN DEFAULT FALSE NOT NULL,
      creator_id INTEGER NOT NULL
    );
  `);
  console.log('Conversations table created');

  // Create conversation_participants table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS conversation_participants (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id),
      user_id INTEGER NOT NULL,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      left_at TIMESTAMP,
      is_admin BOOLEAN DEFAULT FALSE NOT NULL
    );
  `);
  console.log('Conversation participants table created');

  // Create messages table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id INTEGER NOT NULL REFERENCES conversations(id),
      sender_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      read_at TIMESTAMP,
      is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
      reply_to_id UUID REFERENCES messages(id)
    );
  `);
  console.log('Messages table created');

  // Create read_receipts table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS read_receipts (
      id SERIAL PRIMARY KEY,
      message_id UUID NOT NULL REFERENCES messages(id),
      user_id INTEGER NOT NULL,
      read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);
  console.log('Read receipts table created');

  // Add an index for performance on the conversation_id column in messages table
  await executeQuery(`
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
  `);
  console.log('Index for messages by conversation created');

  // Add an index for performance on the conversation_id column in conversation_participants
  await executeQuery(`
    CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
  `);
  console.log('Index for participants by conversation created');

  // Add an index for performance on the user_id column in conversation_participants
  await executeQuery(`
    CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
  `);
  console.log('Index for participants by user created');

  // Add an index for performance on the sender_id column in messages
  await executeQuery(`
    CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
  `);
  console.log('Index for messages by sender created');

  // Add an index for performance on the message_id column in read_receipts
  await executeQuery(`
    CREATE INDEX IF NOT EXISTS idx_read_receipts_message_id ON read_receipts(message_id);
  `);
  console.log('Index for read receipts by message created');

  // Add an index for performance on the user_id column in read_receipts
  await executeQuery(`
    CREATE INDEX IF NOT EXISTS idx_read_receipts_user_id ON read_receipts(user_id);
  `);
  console.log('Index for read receipts by user created');

  console.log('All chat tables created successfully');
}

createTables()
  .then(() => {
    console.log('Chat system tables migration completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error during migration:', err);
    process.exit(1);
  });