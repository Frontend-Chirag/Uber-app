import { headers } from "next/headers";

export interface GeolocationParams {
    city: string;
    country: string;
    region: string;
    latitude: string;
    longitude: string;
}

class Geolocation {
    private static instance: Geolocation;
    private ipToken: string;
    private url: string;

    private constructor() {
        this.ipToken = process.env.NEXT_IP_TOKEN ?? '';
        this.url = process.env.NEXT_IP_URL ?? '';
    }

    public static getInstance(): Geolocation {
        if (!Geolocation.instance) {
            Geolocation.instance = new Geolocation();
        }
        return Geolocation.instance;
    }

    public async getGeolocation(): Promise<GeolocationParams> {
        if (process.env.NODE_ENV === 'development') {
            return {
                city: 'Mumbai',
                country: 'IN',
                region: 'MH',
                latitude: '19.0760',
                longitude: '72.8777',
            };
        }

        try {
            const ip = await this.getIp();
            if (!ip) throw new Error('IP address could not be determined');

            const res = await fetch(`${this.url}/${ip}?token=${this.ipToken}`, { cache: 'no-store' });
            if (!res.ok) throw new Error(`Failed to fetch geolocation: ${res.status}`);

            const data = await res.json();
            const [latitude = '', longitude = ''] = data?.loc?.split(',') || [];

            return {
                city: data?.city || '',
                country: data?.country || '',
                region: data?.region || '',
                latitude,
                longitude,
            };
        } catch (err) {
            console.error('Geolocation error:', err);
            return { city: '', country: '', region: '', latitude: '', longitude: '' };
        }
    }

    private async getIp(): Promise<string | null> {
        const headersList = await headers();

        const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
            || headersList.get('x-real-ip')
            || headersList.get('x-client-ip')
            || headersList.get('cf-connecting-ip')
            || headersList.get('true-client-ip')
            || (process.env.NODE_ENV === 'development' ? '127.0.0.1' : null);

        if (ip === '::1') return '127.0.0.1';
        return ip ?? null;
    }
}


export const geolocation = Geolocation.getInstance()