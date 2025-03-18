
import { InferRequestType, InferResponseType } from 'hono';
import { honoClient } from '@/lib/rpc';
import { useMutation } from '@tanstack/react-query';

type RequestType = InferRequestType<typeof honoClient.api.auth.submit['$post']>
type ResponseType = InferResponseType<typeof honoClient.api.auth.submit['$post']>

export const useSubmit = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
        const response = await honoClient.api.auth.submit['$post']({ json });
        return response.json(); // Ensure the return type matches ResponseType
    }
})