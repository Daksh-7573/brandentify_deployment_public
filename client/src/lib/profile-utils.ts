/**
 * Calculates the profile completion percentage based on the user data
 * 
 * @param userData The user data object
 * @returns A number between 15 and 100 representing the profile completion percentage
 */
export function calculateProfileCompletion(userData?: any): number {
  if (!userData) return 15; // Start with a base level of completion to encourage users
  
  // Define profile fields to check (weighted approach)
  const fields = [
    { field: 'name', weight: 15 },
    { field: 'photoURL', weight: 10 },
    { field: 'title', weight: 10 },
    { field: 'location', weight: 10 },
    { field: 'industry', weight: 10 },
    { field: 'lookingFor', weight: 5 },
    // We'll assume presence of experiences, educations, skills, and projects are checked separately
    // through their respective API calls
  ];
  
  // Calculate basic profile info completion
  let completionScore = 0;
  
  fields.forEach(({ field, weight }) => {
    if (userData[field]) {
      completionScore += weight;
    }
  });
  
  // Ensure a minimum of 15% to encourage users
  return Math.min(Math.max(Math.round(completionScore), 15), 100);
}

/**
 * Calculates the overall profile completion percentage based on user data and related collections
 * 
 * @param userData The user data object
 * @param experiences Array of user experiences
 * @param educations Array of user educations
 * @param skills Array of user skills
 * @param projects Array of user projects
 * @returns A number between 15 and 100 representing the overall profile completion percentage
 */
export function calculateOverallProfileCompletion(
  userData?: any,
  experiences: any[] = [],
  educations: any[] = [],
  skills: any[] = [],
  projects: any[] = [],
  services: any[] = []
): number {
  if (!userData) return 15; // Start with a base level of completion to encourage users
  
  // Debug logs
  console.log("Profile Completion Input:", {
    userData: userData ? `User ID: ${userData.id}` : "No user data",
    experiences: experiences.length,
    educations: educations.length,
    skills: skills.length,
    projects: projects.length,
    services: services.length
  });
  
  // Start with basic profile completion (max 50%)
  const basicCompletion = calculateProfileCompletion(userData);
  let totalCompletion = basicCompletion;
  
  // Add points for each collection (max 50% total)
  if (experiences.length > 0) totalCompletion += 10; // 10% for having experiences
  if (educations.length > 0) totalCompletion += 10; // 10% for having educations
  if (skills.length > 0) totalCompletion += 10; // 10% for having skills
  if (projects.length > 0) totalCompletion += 10; // 10% for having projects
  if (services.length > 0) totalCompletion += 10; // 10% for having services
  
  // Ensure a minimum of 15% to encourage users
  return Math.min(Math.max(Math.round(totalCompletion), 15), 100);
}