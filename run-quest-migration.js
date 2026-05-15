import { config } from 'dotenv';
config(); // Load environment variables

import { up } from './server/migrations/add-quest-uniqueness-constraint.ts';

up().then(() => {
  console.log('✅ Quest uniqueness migration completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
