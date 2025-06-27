import { client } from '@/server/rpc/hono-client';
import { useMutation } from '@tanstack/react-query';
import { InferResponseType, InferRequestType } from 'hono';


type LocationRequest = InferRequestType<typeof client.api.place.loadTSsuggestions.$post>;
type LocationResponse = InferResponseType<typeof client.api.place.loadTSsuggestions.$post>;

export const useLocations = () => {
    const mutation = useMutation<LocationResponse, Error, LocationRequest>({
        mutationFn: async ({ json }) => {
            const response = await client.api.place.loadTSsuggestions.$post({ json });
            return await response.json();
        }
    });

    return mutation
}