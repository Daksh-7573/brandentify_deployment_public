import { pool } from "./db";

let isDatabaseReady = false;

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Wait for database to become ready with exponential backoff retry
 * Prevents schedulers from starting while Neon is in cold start
 */
export async function waitForDatabaseReady(): Promise<boolean> {
  let attempts = 0;
  const maxAttempts = 10;

  console.log('\n🔍 Checking database readiness...');
  console.log('=====================================');

  while (!isDatabaseReady && attempts < maxAttempts) {
    try {
      await pool.query("SELECT 1 as health_check");
      isDatabaseReady = true;
      console.log(`✅ Database is ready (attempt ${attempts + 1}/${maxAttempts})`);
      console.log('=====================================\n');
      return true;
    } catch (err: any) {
      attempts++;
      const isNeonPaused = 
        err.message?.includes("endpoint has been disabled") ||
        err.message?.includes("endpoint is paused") ||
        err.code === 'XX000';
      
      if (isNeonPaused) {
        console.warn(`⏸️  Neon endpoint paused (attempt ${attempts}/${maxAttempts})... waiting for cold start`);
      } else {
        console.warn(`⚠️  DB not ready (attempt ${attempts}/${maxAttempts}): ${err.message}`);
      }
      
      // Exponential backoff: 3s, 6s, 9s, 12s, 15s...
      const backoffMs = Math.min(3000 * attempts, 15000);
      await sleep(backoffMs);
    }
  }

  if (!isDatabaseReady) {
    console.error('❌ Database failed to become ready after all attempts');
    console.error('⚠️  Server will start but schedulers will be disabled');
    console.error('=====================================\n');
  }

  return isDatabaseReady;
}

/**
 * Check if database is currently ready
 */
export function databaseReady(): boolean {
  return isDatabaseReady;
}

/**
 * Reset database ready state (useful for testing)
 */
export function resetDatabaseReadyState(): void {
  isDatabaseReady = false;
}
