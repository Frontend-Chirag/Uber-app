import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import * as z from 'zod'

const TsSuggestionSchema = z.object({
    locale: z.string(),
    lat: z.number(),
    long: z.number(),
    q: z.string(),
    type: z.enum(['pickup', 'destination'])
}).required({
    locale: true,
    lat: true,
    long: true,
    q: true,
    type: true
});




const app = new Hono()
    .post('/loadTSsuggestions', zValidator('json', TsSuggestionSchema), async (ctx) => {

        const { q, lat, locale, long, type } = ctx.req.valid('json');
        const endpoint = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
        const params = new URLSearchParams({
            input: q,
            key: 'AIzaSyDS9iAd2O04zfaHOPZTN26E5eqva9oW864',
            language: locale,
            location: `${lat},${long}`,
            radius: '50000', // 50km search radius
            types: 'geocode' // or 'establishment' for businesses
        });
        const url = `${endpoint}?${params.toString()}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log(`map data ${q}`,)

        const candidates = (data?.predictions || []).map((prediction: any) => {
            return {
                addressLine1: prediction.structured_formatting?.main_text || '',
                addressLine2: prediction.structured_formatting?.secondary_text || '',
                categories: prediction.types?.join(', ') || '',
                id: prediction.place_id,
                provider: 'google'
            };
        }) as {
            addressLine1: string
            addressLine2: string
            categories: string
            id: string
            provider: string
        }[];

        return ctx.json({
            success: true,
            data: {
                candidates
            }
        })
    },)

export default app;