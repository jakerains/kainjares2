// Function to trigger database initialization after deployment
import fetch from 'node-fetch';

export default async function handler(event, context) {
  try {
    console.log('Triggering database initialization...');
    
    // Get site URL from Netlify environment
    const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || 'http://localhost:8888';
    
    // Call the init-db function
    const response = await fetch(`${siteUrl}/.netlify/functions/init-db`);
    const data = await response.json();
    
    console.log('Database initialization response:', data);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Database initialization triggered',
        result: data
      })
    };
  } catch (error) {
    console.error('Error triggering database initialization:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to trigger database initialization',
        details: error.message
      })
    };
  }
} 