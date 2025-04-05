/**
 * Calculates the profile completion percentage based on the user's Basic Information
 * 
 * @param userData The user data object
 * @returns A number between 15 and 100 representing the profile completion percentage
 */
export function calculateProfileCompletion(userData?: any): number {
  if (!userData) return 15; // Start with a base level of completion to encourage users
  
  // Define Basic Information fields to check (weighted approach)
  const basicInfoFields = [
    { field: 'name', weight: 15 },
    { field: 'photoURL', weight: 10 },
    { field: 'title', weight: 10 },
    { field: 'location', weight: 10 },
    { field: 'industry', weight: 10 },
    { field: 'lookingFor', weight: 5 },
    // We'll assume presence of experiences, educations, skills, and projects are checked separately
    // through their respective API calls
  ];
  
  // Log Basic Information for debugging
  console.log("User data being used for calculation:", {
    name: userData.name || null,
    photoURL: userData.photoURL ? "exists" : null,
    title: userData.title || null,
    location: userData.location || null,
    industry: userData.industry || null,
    lookingFor: userData.lookingFor || null
  });
  
  // Calculate basic profile info completion
  let completionScore = 0;
  
  basicInfoFields.forEach(({ field, weight }) => {
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
 * @param services Array of user services
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
  
  // Start with Basic Information completion (max 50%)
  const basicInfoCompletion = calculateProfileCompletion(userData);
  let totalCompletion = basicInfoCompletion;
  
  // Add points for each professional profile section (max 50% total)
  if (experiences.length > 0) totalCompletion += 10; // 10% for having work experiences
  if (educations.length > 0) totalCompletion += 10; // 10% for having education history
  if (skills.length > 0) totalCompletion += 10; // 10% for having skills
  if (projects.length > 0) totalCompletion += 10; // 10% for having projects
  if (services.length > 0) totalCompletion += 10; // 10% for having professional services
  
  // Output the calculated percentage for debugging
  console.log("Profile completion percentage:", totalCompletion);
  
  // Ensure a minimum of 15% to encourage users
  return Math.min(Math.max(Math.round(totalCompletion), 15), 100);
}