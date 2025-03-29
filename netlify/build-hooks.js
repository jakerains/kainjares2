// Build hook to run after Netlify build is complete
const fetch = require('node-fetch');

/**
 * This script is executed after a successful build
 * It attempts to trigger the init-db function to initialize the database
 * But will not fail the build if the function is not available
 */
async function runAfterBuild() {
  console.log('Build completed, running post-build tasks...');
  
  try {
    // Get site URL from Netlify environment
    const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || 'http://localhost:8888';
    
    // Attempt to trigger the init-db function
    console.log(`Attempting to initialize database at ${siteUrl}...`);
    
    try {
      const response = await fetch(`${siteUrl}/.netlify/functions/init-db`, {
        // Set a reasonable timeout to avoid hanging the build
        timeout: 10000
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Database initialization successful:', data);
      } else {
        const errorText = await response.text();
        console.warn('Database initialization response not ok, but build will continue:', errorText);
      }
    } catch (functionError) {
      // Log error but don't fail the build
      console.warn('Could not call init-db function, but build will continue:', functionError.message);
      console.log('This is normal for the first deployment when functions are not yet available.');
    }
  } catch (error) {
    // Log general error but don't fail the build
    console.warn('Error in post-build hook, but build will continue:', error.message);
  }
  
  console.log('Post-build tasks completed - site is ready!');
}

// Run the post-build task, but don't let errors propagate
runAfterBuild().catch(error => {
  console.warn('Error in post-build execution, but build will continue:', error.message);
}); 