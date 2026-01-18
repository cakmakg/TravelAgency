import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * 
 * Logout endpoint that clears the session cookie
 * This endpoint is protected by middleware authentication
 */
export async function POST() {
    try {
        // Create response
        const response = NextResponse.json(
            { success: true, message: 'Logout successful' }
        );

        // Clear the admin session cookie
        response.cookies.delete('admin-session');
        
        // Additional security: Clear any other sensitive cookies if needed
        response.cookies.delete('admin-preferences');

        return response;
    } catch (error) {
        console.error('Logout error:', error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
