import jwt, { JwtPayload } from 'jsonwebtoken';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import crypto from 'crypto';

// Never store sensitive tokens in code - use environment variables
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const JWT_EXPIRES_IN = '24h'; // Tokens expire in 24 hours

/**
 * JWT Authentication Service
 * Provides secure token generation and verification for user sessions
 */
export class AuthService {
  /**
   * Generate a JWT token for authenticated user
   * @param userId User ID to encode in the token
   * @returns Signed JWT token
   */
  static generateToken(userId: number): string {
    const payload = {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: 'HS512', // Using HS512 for enhanced security
    });
  }

  /**
   * Verify and decode a JWT token
   * @param token JWT token to verify
   * @returns Decoded payload if valid, null otherwise
   */
  static verifyToken(token: string): { sub: number } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        algorithms: ['HS512'],
      });
      
      // Safely handle different JWT payload formats
      if (typeof decoded === 'object' && decoded !== null) {
        const jwtPayload = decoded as JwtPayload;
        if (jwtPayload.sub) {
          // Convert string sub to number if needed
          const userId = typeof jwtPayload.sub === 'string' 
            ? parseInt(jwtPayload.sub, 10) 
            : jwtPayload.sub;
          
          return { sub: userId };
        }
      }
      return null;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  /**
   * Authenticate a user based on their token
   * @param token JWT token to authenticate
   * @returns User data if authentication succeeds, null otherwise
   */
  static async authenticateToken(token: string) {
    const decoded = this.verifyToken(token);
    if (!decoded) return null;

    try {
      // Fetch user from database to ensure they still exist and are active
      const [user] = await db.select().from(users).where(eq(users.id, decoded.sub));
      return user || null;
    } catch (error) {
      console.error('User retrieval failed:', error);
      return null;
    }
  }

  /**
   * Generate a secure refresh token
   * @returns Cryptographically secure random token
   */
  static generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }
}

export default AuthService;