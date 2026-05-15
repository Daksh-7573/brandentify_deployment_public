/**
 * Profile Completion Utility
 * Determines if a user's profile is sufficiently complete to access premium features
 */

/**
 * Defines the minimum required fields for profile completeness
 * These are essential fields needed to create a Quantum Card
 */
const REQUIRED_PROFILE_FIELDS = [
  'name',           // Full name
  'title',          // Job title
  'location',       // Location
  'industry',       // Industry
] as const;

/**
 * Check if user profile is complete enough for feature access
 * @param user The user data object
 * @returns true if profile meets minimum requirements, false otherwise
 */
export function isProfileComplete(user: any): boolean {
  if (!user) {
    return false;
  }

  // Check that all required fields exist and are not empty
  return REQUIRED_PROFILE_FIELDS.every(
    (field) => {
      const value = user[field];
      // Must exist, not be null/undefined, and have meaningful content
      return value && value.toString().trim() !== '';
    }
  );
}

/**
 * Get list of missing required profile fields
 * Useful for showing users what they need to complete
 * @param user The user data object
 * @returns Array of missing field names
 */
export function getMissingProfileFields(user: any): string[] {
  if (!user) {
    return [...REQUIRED_PROFILE_FIELDS];
  }

  return REQUIRED_PROFILE_FIELDS.filter((field) => {
    const value = user[field];
    return !value || value.toString().trim() === '';
  });
}

/**
 * Get a human-readable message about missing fields
 * @param user The user data object
 * @returns Message string
 */
export function getProfileCompletionMessage(user: any): string {
  const missingFields = getMissingProfileFields(user);
  
  if (missingFields.length === 0) {
    return 'Your profile is complete!';
  }

  if (missingFields.length === REQUIRED_PROFILE_FIELDS.length) {
    return 'Please complete your profile to unlock this feature.';
  }

  const fieldNames = missingFields
    .map((field) => {
      // Convert camelCase or snake_case to Title Case
      return field
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .trim()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    })
    .join(', ');

  return `Please complete: ${fieldNames}`;
}
