import { pool } from '../db';

async function checkColumns() {
  try {
    // First, check all column names
    const columnQuery = `
      SELECT column_name, data_type, ordinal_position
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    const columnResult = await pool.query(columnQuery);
    console.log("Users table columns:", columnResult.rows);
    
    // Then, query user with ID 1 directly and print all fields
    const userQuery = `
      SELECT * FROM users WHERE id = 1
    `;
    
    const userResult = await pool.query(userQuery);
    console.log("User data with all fields:", userResult.rows[0]);
    
    // Explicitly check for the domain column
    const domainQuery = `
      SELECT id, domain FROM users WHERE id = 1
    `;
    
    const domainResult = await pool.query(domainQuery);
    console.log("Domain value:", domainResult.rows[0]);
    
    // Now use our standard query format but add debug
    const standardQuery = `
      SELECT 
        id, username, email, password, phone_number as "phoneNumber", 
        name, photo_url as "photoURL", title, about_me as "aboutMe", 
        location, industry, domain, looking_for as "lookingFor", 
        visiting_card_type as "visitingCardType", profile_completed as "profileCompleted", 
        email_verified as "emailVerified", email_verification_token as "emailVerificationToken", 
        email_verification_expires as "emailVerificationExpires", created_at as "createdAt"
      FROM users WHERE id = 1
    `;
    
    const standardResult = await pool.query(standardQuery);
    console.log("Standard query result:", standardResult.rows[0]);
    
    // Print all keys in the result
    const keys = Object.keys(standardResult.rows[0]);
    console.log("Keys in result:", keys);
  } catch (error) {
    console.error("Error checking columns:", error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the check
checkColumns().catch(console.error);