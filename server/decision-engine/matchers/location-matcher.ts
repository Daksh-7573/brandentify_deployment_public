/**
 * Location Matcher
 * 
 * Calculates match scores between users based on geographic proximity
 * and location preferences.
 */

import { LocationMatchResult } from "../types/index";

/**
 * Calculate location proximity score between two users
 */
export function calculateLocationProximity(
  userA: any,
  userB: any
): LocationMatchResult {
  // Extract locations
  const userLocation = userA.location?.toLowerCase() || "";
  const matchLocation = userB.location?.toLowerCase() || "";
  
  if (!userLocation || !matchLocation) {
    return {
      score: 0.5, // Neutral score if location information is missing
      distance: null,
      sameCity: false,
      sameRegion: false,
      sameCountry: false,
      contributingFactors: {}
    };
  }
  
  // Check for exact location match
  if (userLocation === matchLocation) {
    return {
      score: 1.0,
      distance: 0,
      sameCity: true,
      sameRegion: true,
      sameCountry: true,
      contributingFactors: { exactMatch: true }
    };
  }
  
  // Parse locations to identify city, region, country
  const userLocationParts = parseLocation(userLocation);
  const matchLocationParts = parseLocation(matchLocation);
  
  // Check for city match
  const sameCity = userLocationParts.city && matchLocationParts.city &&
                  userLocationParts.city === matchLocationParts.city;
  
  // Check for region match
  const sameRegion = userLocationParts.region && matchLocationParts.region &&
                    userLocationParts.region === matchLocationParts.region;
  
  // Check for country match
  const sameCountry = userLocationParts.country && matchLocationParts.country &&
                     userLocationParts.country === matchLocationParts.country;
  
  // Calculate approximate distance if possible
  const distance = calculateApproximateDistance(userLocationParts, matchLocationParts);
  
  // Calculate location score
  let locationScore = 0.0;
  
  if (sameCity) {
    locationScore = 1.0;
  } else if (sameRegion) {
    locationScore = 0.8;
  } else if (sameCountry) {
    locationScore = 0.6;
  } else if (distance !== null) {
    // Score based on distance
    if (distance < 50) {
      locationScore = 0.9; // Very close
    } else if (distance < 100) {
      locationScore = 0.7; // Nearby
    } else if (distance < 300) {
      locationScore = 0.5; // Same metropolitan area or short trip
    } else if (distance < 1000) {
      locationScore = 0.3; // Within same larger region
    } else {
      locationScore = 0.1; // Far away
    }
  } else {
    // Perform text similarity if we can't determine distance
    const textSimilarity = calculateLocationTextSimilarity(userLocation, matchLocation);
    locationScore = 0.2 + (textSimilarity * 0.3); // Base 0.2 + up to 0.3 for text similarity
  }
  
  // Check for latitude/longitude proximity if available
  if (userA.latitude && userA.longitude && userB.latitude && userB.longitude) {
    const preciseDistance = calculateHaversineDistance(
      userA.latitude, userA.longitude,
      userB.latitude, userB.longitude
    );
    
    // Override with more precise distance-based score
    if (preciseDistance < 10) {
      locationScore = 1.0; // Same area
    } else if (preciseDistance < 50) {
      locationScore = 0.9; // Very close
    } else if (preciseDistance < 100) {
      locationScore = 0.7; // Nearby
    } else if (preciseDistance < 300) {
      locationScore = 0.5; // Same metropolitan area or short trip
    } else if (preciseDistance < 1000) {
      locationScore = 0.3; // Within same larger region
    } else {
      locationScore = 0.1; // Far away
    }
    
    return {
      score: locationScore,
      distance: preciseDistance,
      sameCity,
      sameRegion,
      sameCountry,
      contributingFactors: { 
        hasPreciseCoordinates: true,
        preciseDistance 
      }
    };
  }
  
  return {
    score: locationScore,
    distance,
    sameCity,
    sameRegion,
    sameCountry,
    contributingFactors: {
      textSimilarity: calculateLocationTextSimilarity(userLocation, matchLocation)
    }
  };
}

/**
 * Parse a location string into city, region, country
 */
function parseLocation(location: string): { city: string | null, region: string | null, country: string | null } {
  if (!location) {
    return { city: null, region: null, country: null };
  }
  
  // Clean up the location string
  const cleanLocation = location.replace(/[^\w\s,]/gi, '').toLowerCase();
  
  // Try to split by comma which is common in location formatting
  const parts = cleanLocation.split(',').map(part => part.trim());
  
  if (parts.length === 3) {
    // Format: City, Region, Country
    return {
      city: parts[0] || null,
      region: parts[1] || null,
      country: parts[2] || null
    };
  } else if (parts.length === 2) {
    // Format: City, Country or Region, Country
    return {
      city: parts[0] || null,
      region: parts[0] || null, // Use the first part as both city and region
      country: parts[1] || null
    };
  } else if (parts.length === 1) {
    // Just one part - try to guess if it's a city or country
    // In a real implementation, we would use a location database
    return {
      city: parts[0] || null,
      region: null,
      country: parts[0] || null // Assume it could be a country too
    };
  }
  
  return { city: null, region: null, country: null };
}

/**
 * Calculate approximate distance between two locations based on text
 * Returns null if we can't determine a distance
 */
function calculateApproximateDistance(
  locationA: { city: string | null, region: string | null, country: string | null },
  locationB: { city: string | null, region: string | null, country: string | null }
): number | null {
  // In a real implementation, we would use a geocoding service or location database
  // to get coordinates and calculate precise distances
  
  // For this prototype, we'll return null as we don't have coordinates
  return null;
}

/**
 * Calculate text similarity between location strings
 */
function calculateLocationTextSimilarity(locationA: string, locationB: string): number {
  if (!locationA || !locationB) return 0;
  
  // Simple word overlap similarity
  const wordsA = new Set(locationA.toLowerCase().split(/[\s,]+/));
  const wordsB = new Set(locationB.toLowerCase().split(/[\s,]+/));
  
  // Count shared words
  let sharedCount = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) sharedCount++;
  }
  
  // Calculate Jaccard similarity
  const unionSize = wordsA.size + wordsB.size - sharedCount;
  return unionSize > 0 ? sharedCount / unionSize : 0;
}

/**
 * Calculate Haversine distance between two points on Earth
 * Returns distance in kilometers
 */
function calculateHaversineDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  // Convert latitude and longitude from degrees to radians
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Earth's radius in kilometers
  const R = 6371;
  
  // Distance in kilometers
  return R * c;
}