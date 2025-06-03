import { Request, Response } from 'express';
import { db } from './db';
import { users } from '../shared/schema';
import { and, eq, sql, isNull, not, lte, gte } from 'drizzle-orm';

/**
 * Update a user's geolocation coordinates
 */
export async function updateUserGeolocation(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    const { latitude, longitude, geoVisibleNearby = true } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    // Validate lat/long
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ error: 'Invalid latitude. Must be between -90 and 90.' });
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'Invalid longitude. Must be between -180 and 180.' });
    }
    
    // Update the user's geolocation
    await db.update(users).set({
      geoLatitude: sql`${lat}`,
      geoLongitude: sql`${lng}`,
      geoVisibleNearby,
      geoLastUpdated: new Date()
    }).where(eq(users.id, userId));
    
    res.status(200).json({ 
      success: true, 
      message: 'Geolocation updated successfully',
      data: {
        latitude: lat,
        longitude: lng,
        geoVisibleNearby
      }
    });
  } catch (error) {
    console.error('Error updating geolocation:', error);
    res.status(500).json({ error: 'Failed to update geolocation' });
  }
}

/**
 * Update a user's visibility in the radar feature
 */
export async function updateUserRadarVisibility(req: Request, res: Response) {
  try {
    const { userId, visible } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (visible === undefined) {
      return res.status(400).json({ error: 'Visibility setting is required' });
    }
    
    // Update the user's visibility setting
    await db.update(users).set({
      geoVisibleNearby: visible === true
    }).where(eq(users.id, userId));
    
    res.status(200).json({ 
      success: true, 
      message: 'Radar visibility updated successfully',
      data: {
        geoVisibleNearby: visible === true
      }
    });
  } catch (error) {
    console.error('Error updating radar visibility:', error);
    res.status(500).json({ error: 'Failed to update radar visibility' });
  }
}

/**
 * Get nearby users using PostgreSQL distance calculation
 * 
 * This function calculates distance between two points using the Haversine formula
 * which accounts for the Earth's curvature
 */
export async function getNearbyUsers(req: Request, res: Response) {
  try {
    const { latitude, longitude, radius = 10, userId } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const maxRadius = parseFloat(radius as string);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ error: 'Invalid latitude. Must be between -90 and 90.' });
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'Invalid longitude. Must be between -180 and 180.' });
    }
    
    if (isNaN(maxRadius) || maxRadius <= 0 || maxRadius > 100) {
      return res.status(400).json({ error: 'Invalid radius. Must be between 0 and 100 km.' });
    }
    
    // Calculate distance using the Haversine formula (in kilometers)
    // 6371 is the Earth's radius in kilometers
    const distanceCalculation = sql`
      (6371 * acos(
        cos(radians(${lat})) * 
        cos(radians(geo_latitude)) * 
        cos(radians(geo_longitude) - radians(${lng})) + 
        sin(radians(${lat})) * 
        sin(radians(geo_latitude))
      ))
    `;
    
    // Execute the query
    const nearbyUsers = await db.select({
      id: users.id,
      name: users.name,
      username: users.username,
      photoURL: users.photoURL,
      title: users.title,
      location: users.location,
      visitingCardType: users.visitingCardType,
      industry: users.industry,
      lookingFor: users.lookingFor,
      distance: distanceCalculation
    })
    .from(users)
    .where(and(
      not(isNull(users.geoLatitude)),
      not(isNull(users.geoLongitude)),
      eq(users.geoVisibleNearby, true),
      userId ? not(eq(users.id, parseInt(userId as string))) : sql`1=1`
    ))
    .orderBy(distanceCalculation);
    
    res.status(200).json(nearbyUsers);
  } catch (error) {
    console.error('Error finding nearby users:', error);
    res.status(500).json({ error: 'Failed to find nearby users' });
  }
}