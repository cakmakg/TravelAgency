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
 * Note: In production, use bcrypt.compare() with hashed password from database
 */
export async function verifyCredentials(email: string, password: string): Promise<boolean> {
    const adminEmail = process.env.ADMIN_EMAIL!;
    const adminPassword = process.env.ADMIN_PASSWORD!;

    // FORCE HARDCODED CREDENTIALS FOR DEBUGGING
    const TARGET_EMAIL = 'admin@russoluxtours.de';
    // Hash for 'RussoLux2026!'
    const TARGET_HASH = '$2b$10$tUUemSJgbfXhTFH.LgwXJup6UoxMAp6i36lKZGRiXcgaGuCkCNdf2';

    console.log(`[AUTH] Checking credentials for: ${email}`);

    // First check: Email must match
    if (email !== TARGET_EMAIL) {
        console.warn(`[AUTH] Email mismatch! Received: '${email}' vs Expected: '${TARGET_EMAIL}'`);
        // Add delay to prevent timing attacks
        await new Promise(resolve => setTimeout(resolve, 100));
        return false;
    }

    // Second check: Use bcrypt for password comparison
    try {
        const isPasswordValid = await bcrypt.compare(password, TARGET_HASH);
        if (isPasswordValid) {
            console.log('[AUTH] Password success!');
        } else {
            console.warn('[AUTH] Password mismatch!');
        }
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
