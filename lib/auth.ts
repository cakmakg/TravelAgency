import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// Ensure required environment variables are set
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}

if (!process.env.ADMIN_EMAIL) {
    throw new Error('ADMIN_EMAIL environment variable is required');
}

if (!process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD environment variable is required');
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const SESSION_EXPIRATION_HOURS = 2; // Security: Reduced from 24 to 2 hours

export interface SessionPayload {
    username: string;
    expiresAt: Date;
}

export async function createSession(username: string): Promise<string> {
    const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_HOURS * 60 * 60 * 1000);

    const token = await new SignJWT({ username, expiresAt: expiresAt.toISOString() })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_EXPIRATION_HOURS}h`)
        .sign(JWT_SECRET);

    return token;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);

        const expiresAt = new Date(payload.expiresAt as string);

        // Additional check: Ensure token hasn't expired
        if (expiresAt < new Date()) {
            return null;
        }

        return {
            username: payload.username as string,
            expiresAt,
        };
    } catch (error) {
        console.error('Session verification failed:', error instanceof Error ? error.message : 'Unknown error');
        return null;
    }
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-session')?.value;

    if (!token) return null;

    return verifySession(token);
}

/**
 * Verify admin credentials with bcrypt password hashing
 * Credentials are read exclusively from environment variables
 */
export async function verifyCredentials(email: string, password: string): Promise<boolean> {
    const adminEmail = process.env.ADMIN_EMAIL!;
    const adminPasswordHash = process.env.ADMIN_PASSWORD!;

    // First check: Email must match
    if (email !== adminEmail) {
        // Add delay to prevent timing attacks
        await new Promise(resolve => setTimeout(resolve, 100));
        return false;
    }

    // Second check: Use bcrypt for password comparison
    try {
        const isPasswordValid = await bcrypt.compare(password, adminPasswordHash);
        return isPasswordValid;
    } catch (error) {
        // If bcrypt fails (e.g., invalid hash format), return false
        console.error('Password comparison error:', error instanceof Error ? error.message : 'Unknown error');
        return false;
    }
}

/**
 * Generate bcrypt hash for a password (for setup/migration purposes)
 * Run this once to generate a hashed password for ADMIN_PASSWORD env variable
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}
