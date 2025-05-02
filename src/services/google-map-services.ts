import { getGeocode, getLatLng } from "use-places-autocomplete";

export interface PlaceDetails {
    address: string;
    lat: number;
    lng: number;
    placeId?: string;
}

export class GoogleMapService {
    private static instance: GoogleMapService;
    private isInitialized: boolean = false;
    private initializationPromise: Promise<void> | null = null;
    private autocompleteService: google.maps.places.AutocompleteService | null = null;

    private constructor() {}

    public static getInstance(): GoogleMapService {
        if (!GoogleMapService.instance) {
            GoogleMapService.instance = new GoogleMapService();
        }
        return GoogleMapService.instance;
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            console.log('Google Maps already initialized');
            return;
        }

        if (this.initializationPromise) {
            console.log('Initialization already in progress');
            return this.initializationPromise;
        }

        this.initializationPromise = this.initializeGoogleMaps();
        return this.initializationPromise;
    }

    private async initializeGoogleMaps(): Promise<void> {
        try {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (!apiKey) {
                throw new Error('Google Maps API key is not configured');
            }

            console.log('Loading Google Maps script...');
            await this.loadGoogleMapsScript(apiKey);
            
            // Wait for Google Maps to be fully loaded
            await this.waitForGoogleMaps();
            
            // Verify that the Google Maps API is properly loaded
            if (!window.google || !window.google.maps || !window.google.maps.places) {
                throw new Error('Google Maps API not properly loaded');
            }

            // Initialize the Places service
            this.autocompleteService = new window.google.maps.places.AutocompleteService();
            
            // Test the service to ensure it's working
            await this.testPlacesService();

            this.isInitialized = true;
            console.log('Google Maps and Places service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Google Maps:', error);
            this.isInitialized = false;
            throw error;
        } finally {
            this.initializationPromise = null;
        }
    }

    private waitForGoogleMaps(): Promise<void> {
        return new Promise((resolve) => {
            if (window.google && window.google.maps && window.google.maps.places) {
                resolve();
            } else {
                const checkGoogleMaps = setInterval(() => {
                    if (window.google && window.google.maps && window.google.maps.places) {
                        clearInterval(checkGoogleMaps);
                        resolve();
                    }
                }, 100);
            }
        });
    }

    private async testPlacesService(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.autocompleteService) {
                reject(new Error('Autocomplete service not initialized'));
                return;
            }

            this.autocompleteService.getPlacePredictions(
                {
                    input: 'test',
                    types: ['address']
                },
                (predictions, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        resolve();
                    } else {
                        reject(new Error(`Places service test failed with status: ${status}`));
                    }
                }
            );
        });
    }

    private loadGoogleMapsScript(apiKey: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.maps) {
                console.log('Google Maps already loaded');
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                console.log('Google Maps script loaded');
                resolve();
            };
            
            script.onerror = () => {
                console.error('Failed to load Google Maps script');
                reject(new Error('Failed to load Google Maps script'));
            };

            document.head.appendChild(script);
        });
    }

    public async getPlaceDetails(address: string): Promise<PlaceDetails> {
        if (!this.isInitialized) {
            throw new Error('Google Maps not initialized');
        }

        try {
            const results = await getGeocode({ address });
            const { lat, lng } = getLatLng(results[0]);
            
            return {
                address,
                lat,
                lng,
                placeId: results[0].place_id
            };
        } catch (error) {
            console.error('Error fetching place details:', error);
            throw error;
        }
    }

    public getAutocompleteService(): google.maps.places.AutocompleteService | null {
        return this.autocompleteService;
    }
}