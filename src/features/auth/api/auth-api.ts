
import { InferRequestType, InferResponseType } from 'hono';
import { honoClient } from '@/lib/rpc';
import { useMutation } from '@tanstack/react-query';

type RequestType = InferRequestType<typeof honoClient.api.auth.submit['$post']>
type ResponseType = InferResponseType<typeof honoClient.api.auth.submit['$post']>

export const useSubmit = () => {
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await honoClient.api.auth.submit['$post']({ json }, {
                headers: {
                    'X-Driver-Status': 'true',  // ✅ Sending isDRIVER in headers
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const errordata = await response.json();
                throw new Error(errordata.error);
            }
            return response.json(); // Ensure the return type matches ResponseType
        }
    });

    return mutation;
} 