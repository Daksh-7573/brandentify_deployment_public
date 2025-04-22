/**
 * Demo Profile Creation Script (CommonJS version)
 * 
 * This script creates a complete demo profile with work experiences,
 * skills, projects, and services for testing.
 */
const { pool } = require('./server/db');

async function createDemoProfile() {
  const client = await pool.connect();
  
  try {
    console.log('Starting demo profile creation...');
    await client.query('BEGIN');
    
    // Create demo user
    console.log('Creating demo user...');
    const userResult = await client.query(`
      INSERT INTO users (
        username, 
        email, 
        name, 
        title, 
        about_me, 
        location, 
        industry, 
        domain, 
        looking_for, 
        what_i_offer, 
        profile_completed, 
        email_verified,
        created_at
      ) VALUES (
        'demo_user', 
        'demo@example.com', 
        'Demo User', 
        'Software Developer', 
        'I am a software developer with experience in React, Node.js, and PostgreSQL.', 
        'San Francisco, CA', 
        'Technology', 
        'software', 
        'Networking Opportunities', 
        'I offer development services and technical consulting.', 
        50, 
        true,
        NOW()
      ) RETURNING id
    `);
    
    const userId = userResult.rows[0].id;
    console.log(`Demo user created with ID: ${userId}`);
    
    // Add work experiences
    console.log('Adding work experiences...');
    await client.query(`
      INSERT INTO work_experiences (
        user_id, 
        title, 
        company, 
        location, 
        industry, 
        start_date, 
        end_date, 
        description
      ) VALUES 
      (
        $1, 
        'Senior Developer', 
        'Tech Solutions Inc.', 
        'San Francisco, CA', 
        'Technology', 
        '2020-01-01', 
        NULL, 
        'Leading development of enterprise web applications using React, Node.js, and PostgreSQL.'
      ),
      (
        $1, 
        'Web Developer', 
        'Digital Agency', 
        'Seattle, WA', 
        'Technology', 
        '2017-06-01', 
        '2019-12-31', 
        'Built responsive web applications and e-commerce solutions for various clients.'
      )
    `, [userId]);
    
    // Add skills
    console.log('Adding skills...');
    await client.query(`
      INSERT INTO skills (
        user_id, 
        name, 
        level, 
        proficiency
      ) VALUES 
      ($1, 'React', 'Advanced', 90),
      ($1, 'Node.js', 'Intermediate', 80),
      ($1, 'PostgreSQL', 'Intermediate', 75),
      ($1, 'JavaScript', 'Advanced', 95),
      ($1, 'TypeScript', 'Intermediate', 80)
    `, [userId]);
    
    // Add projects
    console.log('Adding projects...');
    await client.query(`
      INSERT INTO projects (
        user_id,
        title,
        description,
        start_date,
        project_url,
        category,
        thumbnail_url,
        media_urls,
        created_at,
        updated_at
      ) VALUES 
      (
        $1,
        'E-commerce Platform',
        'Built a complete e-commerce platform with React, Node.js, and PostgreSQL. Features include user authentication, product listings, shopping cart, and payment processing.',
        '2021-03-15',
        'https://example-ecommerce.com',
        'Web Development',
        'https://via.placeholder.com/400x300?text=E-commerce+Platform',
        '["https://via.placeholder.com/800x600?text=E-commerce+Screenshot+1", "https://via.placeholder.com/800x600?text=E-commerce+Screenshot+2"]'::jsonb,
        NOW(),
        NOW()
      ),
      (
        $1,
        'Task Management App',
        'Developed a collaborative task management application with real-time updates. Used React, TypeScript, and Firebase.',
        '2022-01-10',
        'https://example-taskapp.com',
        'Web Application',
        'https://via.placeholder.com/400x300?text=Task+Management+App',
        '["https://via.placeholder.com/800x600?text=Task+App+Screenshot+1", "https://via.placeholder.com/800x600?text=Task+App+Screenshot+2"]'::jsonb,
        NOW(),
        NOW()
      )
    `, [userId]);
    
    // Add services
    console.log('Adding services...');
    await client.query(`
      INSERT INTO services (
        user_id,
        title,
        description,
        category,
        price_usd,
        is_hourly,
        features,
        "order",
        is_active,
        created_at,
        updated_at
      ) VALUES 
      (
        $1,
        'Web Application Development',
        'Full-stack web application development with modern technologies including React, Node.js, and cloud services',
        'development',
        '75.00',
        true,
        '["Requirements analysis and planning", "UI/UX design and prototyping", "Frontend and backend development", "Database design and optimization", "Testing and deployment"]'::jsonb,
        0,
        true,
        NOW(),
        NOW()
      ),
      (
        $1,
        'Technical Consulting',
        'Expert technical consulting for startups and businesses looking to improve their tech stack or solve specific technical challenges',
        'consulting',
        '120.00',
        true,
        '["Technology stack assessment", "Performance optimization", "Architecture planning", "Security review", "Code quality assessment"]'::jsonb,
        1,
        true,
        NOW(),
        NOW()
      )
    `, [userId]);
    
    await client.query('COMMIT');
    console.log('Demo profile created successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during demo profile creation:', error);
    throw error;
  } finally {
    client.release();
    // Close the pool to end the process
    await pool.end();
  }
}

// Run the creation function
createDemoProfile()
  .then(() => {
    console.log('Demo profile creation script completed.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Demo profile creation failed:', err);
    process.exit(1);
  });