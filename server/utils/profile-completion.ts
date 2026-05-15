/**
 * Profile Completion Validation Utility
 * Backend utility to check if user profile meets requirements for feature access
 */

/**
 * Required fields for basic profile completeness
 * These are essential for accessing premium features like Quantum Cards
 */
const REQUIRED_PROFILE_FIELDS = [
  'name',           // Full name
  'title',          // Job title
  'location',       // Location
  'industry',       // Industry
] as const;

/**
 * Check if user profile is complete enough for feature access
 * @param user The user object from database
 * @returns true if profile meets minimum requirements, false otherwise
 */
export function isUserProfileComplete(user: any): boolean {
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
 * @param user The user object from database
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
 * Middleware to require complete profile for accessing certain features
 * 
 * Usage in routes:
 * ```typescript
 * router.get('/quantum-card', requireCompleteProfile, handler);
 * ```
 */
export const requireCompleteProfile = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.id || req.session?.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get user from database
    const { db } = await import('@/database');
    const { users } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then(results => results[0]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if profile is complete
    if (!isUserProfileComplete(user)) {
      const missingFields = getMissingProfileFields(user);
      return res.status(403).json({
        success: false,
        message: 'Please complete your profile to unlock this feature',
        missingFields,
        profileCompletion: {
          isComplete: false,
          required: [...REQUIRED_PROFILE_FIELDS],
          missing: missingFields
        }
      });
    }

    // Profile is complete, proceed
    req.userProfile = user;
    next();
  } catch (error) {
    console.error('[Profile Completion] Middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking profile status'
    });
  }
};

/**
 * Express middleware version for easier use
 * Usage: app.use('/quantum-card', requireCompleteProfileMiddleware);
 */
export function requireCompleteProfileMiddleware(req: any, res: any, next: any) {
  return requireCompleteProfile(req, res, next);
}
