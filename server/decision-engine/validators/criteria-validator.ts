/**
 * Criteria Validator
 * 
 * Validates and normalizes matching criteria to ensure it can be
 * properly processed by the matching algorithms.
 */

import { MatchCriteria } from "../types/index";

/**
 * Validate and normalize matching criteria
 */
export function validateCriteria(criteria: MatchCriteria): MatchCriteria {
  const validatedCriteria: MatchCriteria = {
    lookingFor: criteria.lookingFor || "connection"
  };
  
  // Validate and clean job title
  if (criteria.targetJobTitle) {
    validatedCriteria.targetJobTitle = sanitizeAndNormalize(criteria.targetJobTitle);
  }
  
  // Validate and clean experience level
  if (criteria.experienceLevel) {
    validatedCriteria.experienceLevel = normalizeExperienceLevel(criteria.experienceLevel);
  }
  
  // Validate and clean industry
  if (criteria.industry) {
    validatedCriteria.industry = sanitizeAndNormalize(criteria.industry);
  }
  
  // Validate and clean domain
  if (criteria.domain) {
    validatedCriteria.domain = sanitizeAndNormalize(criteria.domain);
  }
  
  // Validate and clean location
  if (criteria.location) {
    validatedCriteria.location = sanitizeAndNormalize(criteria.location);
  }
  
  // Validate and clean skills array
  if (criteria.skills && Array.isArray(criteria.skills)) {
    validatedCriteria.skills = criteria.skills
      .map(skill => sanitizeAndNormalize(skill))
      .filter(Boolean);
  }
  
  // Validate and clean interests array
  if (criteria.interests && Array.isArray(criteria.interests)) {
    validatedCriteria.interests = criteria.interests
      .map(interest => sanitizeAndNormalize(interest))
      .filter(Boolean);
  }
  
  // Validate and clean personality traits array
  if (criteria.personalityTraits && Array.isArray(criteria.personalityTraits)) {
    validatedCriteria.personalityTraits = criteria.personalityTraits
      .map(trait => sanitizeAndNormalize(trait))
      .filter(Boolean);
  }
  
  // Validate and clean availability preference
  if (criteria.availabilityPreference) {
    validatedCriteria.availabilityPreference = normalizeAvailability(criteria.availabilityPreference);
  }
  
  // Validate and clean communication style
  if (criteria.communicationStyle) {
    validatedCriteria.communicationStyle = sanitizeAndNormalize(criteria.communicationStyle);
  }
  
  // Remote preference is a boolean, copy as is
  if (typeof criteria.remotePreference === 'boolean') {
    validatedCriteria.remotePreference = criteria.remotePreference;
  }
  
  return validatedCriteria;
}

/**
 * Sanitize and normalize a string value
 */
function sanitizeAndNormalize(value: string): string {
  if (!value) return '';
  
  // Trim whitespace
  let sanitized = value.trim();
  
  // Remove any HTML or script tags for security
  sanitized = sanitized.replace(/<\/?[^>]+(>|$)/g, '');
  
  // Normalize by removing excess whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  return sanitized;
}

/**
 * Normalize experience level to standard values
 */
function normalizeExperienceLevel(level: string): string {
  const normalized = level.toLowerCase().trim();
  
  // Map common variations to standard values
  if (normalized.includes('entry') || 
      normalized.includes('junior') || 
      normalized.includes('beginner')) {
    return 'Entry-Level';
  }
  
  if (normalized.includes('mid') || 
      normalized.includes('intermediate')) {
    return 'Mid-Level';
  }
  
  if (normalized.includes('senior') || 
      normalized.includes('experienced')) {
    return 'Senior';
  }
  
  if (normalized.includes('lead') || 
      normalized.includes('principal') || 
      normalized.includes('staff')) {
    return 'Lead';
  }
  
  if (normalized.includes('manager') || 
      normalized.includes('management')) {
    return 'Management';
  }
  
  if (normalized.includes('director') || 
      normalized.includes('executive') || 
      normalized.includes('vp') || 
      normalized.includes('chief') || 
      normalized.includes('cxo')) {
    return 'Executive';
  }
  
  // If we can't map it, return as is
  return level;
}

/**
 * Normalize availability preference to standard values
 */
function normalizeAvailability(availability: string): string {
  const normalized = availability.toLowerCase().trim();
  
  if (normalized.includes('full') && normalized.includes('time')) {
    return 'Full-Time';
  }
  
  if (normalized.includes('part') && normalized.includes('time')) {
    return 'Part-Time';
  }
  
  if (normalized.includes('contract') || normalized.includes('freelance')) {
    return 'Contract';
  }
  
  if (normalized.includes('temporary') || normalized.includes('temp')) {
    return 'Temporary';
  }
  
  if (normalized.includes('intern') || normalized.includes('internship')) {
    return 'Internship';
  }
  
  // If we can't map it, return as is
  return availability;
}