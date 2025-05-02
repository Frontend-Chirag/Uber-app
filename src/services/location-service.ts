import { Location } from "@prisma/client";


export class LocationService {
    private static instance: LocationService;
    private currentLocation: {
        latitude: number;
        longitude: number;
        state: string;
        country: string;
        city: string;
        zip: string;
    } | null = null;

    private readonly GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

    private constructor() { }

    static getInstance(): LocationService {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService();
        }
        return LocationService.instance;
    }

    async getCurrentLocation(): Promise<{
        latitude: number;
        longitude: number;
        state: string;
        country: string;
        city: string;
        zip: string;
    }> {
        if (this.currentLocation) {
            return this.currentLocation;
        }

        try {
            const position = await this.getGeolocation();
            const locationData = await this.reverseGeocode(position.coords.latitude, position.coords.longitude);

            this.currentLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                state: locationData.state,
                country: locationData.country,
                city: locationData.city,
                zip: locationData.zip
            };

            return this.currentLocation;
        } catch (error) {
            console.error('Error getting current location:', error);
            throw new Error('Failed to get location');
        }
    }

    private getGeolocation(): Promise<GeolocationPosition> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        });
    }

    private async reverseGeocode(latitude: number, longitude: number): Promise<{
        state: string;
        country: string;
        city: string;
        zip: string;
    }> {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.GOOGLE_MAPS_API_KEY}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch geocoding data');
            }

            const data = await response.json();
            console.log('current location', data);

            if (data.status !== 'OK' || !data.results[0]) {
                throw new Error('No results found for the given coordinates');
            }

            const addressComponents = data.results[0].address_components;
            const getComponents = (type: string) => addressComponents.find((c: any) => c.types.includes(type))?.long_name;
            const state = getComponents('administrative_area_level_1');
            const country = getComponents('country');
            const city = getComponents('locality');
            const zip = getComponents('postal_code');

            if (!state || !country) {
                throw new Error('Could not determine state or country');
            }

            return { state, country, city, zip };
        } catch (error) {
            console.error('Error in reverse geocoding:', error);
            throw new Error('Failed to reverse geocode');
        }
    }

    async getlocationFromIp(ip: string): Promise<Location> {
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await response.json();
        console.log('location from ip', data);
        return {
            type: "Point",
            coordinates: [data.longitude, data.latitude],
            address: data.city,
            city: data.city,
            state: data.region,
            country: data.country,
            postalCode: data.postal,
            placeId: '',
            updatedAt: new Date()
        };
    }

    // Method to update location (can be called periodically or when significant movement is deteted)
    async updateLocation(): Promise<void> {
        this.currentLocation = null;
        await this.getCurrentLocation();
    }

    // Method to get region-specific document requirements
    async getDocumentRequirements(): Promise<any> {
        const location = await this.getCurrentLocation();

        // TODO: Fetch document requirements based on region/country   
        return {};
    }



}