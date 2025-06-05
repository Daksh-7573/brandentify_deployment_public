/**
 * Force cache refresh script to clear all cached user data
 */

// Clear browser cache for user profile data
if (typeof window !== 'undefined') {
  // Clear localStorage
  localStorage.removeItem('userData');
  localStorage.removeItem('profileData');
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Force page reload with cache bypass
  window.location.reload(true);
}

console.log('Cache cleared - page will reload');