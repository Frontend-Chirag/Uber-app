import { headers } from 'next/headers';

/**
 * Gets the client's IP address from various headers
 * @returns {Promise<string>} The client's IP address
 */
export async function getClientIp(): Promise<string> {
    const headersList = await headers();
    
    // Try different headers in order of preference
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headersList.get('x-real-ip') ||
        headersList.get('x-client-ip') ||
        headersList.get('cf-connecting-ip') ||
        headersList.get('true-client-ip') ||
        (process.env.NODE_ENV === 'development' ? '127.0.0.1' : 'unknown');

    // Handle IPv6 localhost
    if (ip === '::1') {
        return '127.0.0.1';
    }

    return ip;
}
