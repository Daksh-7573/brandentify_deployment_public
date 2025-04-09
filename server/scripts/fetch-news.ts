/**
 * Script to fetch news from configured sources
 * Can be run manually or as a scheduled job
 */

import { fetchAndStoreNews, createNewsPulsesFromArticles } from '../services/news-service';
import { storage } from '../storage';

/**
 * Main function to fetch news and create pulses
 */
async function main() {
  console.log('====== NEWS FETCH SCRIPT ======');
  console.log('Starting news fetch at', new Date().toISOString());
  
  // Step 1: Fetch news from sources
  const articlesAdded = await fetchAndStoreNews();
  console.log(`Added ${articlesAdded} new articles to the database`);
  
  if (articlesAdded === 0) {
    console.log('No new articles found, exiting');
    return;
  }
  
  // Step 2: Create news pulses for system user (ID 1)
  const pulsesCreated = await createNewsPulsesFromArticles(1);
  console.log(`Created ${pulsesCreated} news pulses`);
  
  console.log('News fetch completed successfully');
  
  return { articlesAdded, pulsesCreated };
}

export default main;