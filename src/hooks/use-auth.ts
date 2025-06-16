import { submit } from "@/actions/auth-actions";
import { Role } from "@prisma/client";
import { client } from '@/server/rpc/hono-client';
import { InferRequestType, InferResponseType } from 'hono';
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner";
import { useRouter } from 'next/navigation'


type AuthRequest = InferRequestType<typeof client.api.auth.submit.$post>;
type AuthResponse = InferResponseType<typeof client.api.auth.submit.$post>;


export const useAuth = () => {
    const router = useRouter();
    const mutation = useMutation<AuthResponse, Error, AuthRequest>({
        mutationFn: async ({ json }) => {
            const response = await client.api.auth.submit.$post({ json });

            if (!response.ok) {
                throw new Error(response.statusText, { cause: await response.json() })
            };

            if (response.redirect) {
                router.replace(`/${response.redirect}`)
            }

            return await response.json() as AuthResponse;
        },
        onError: (error) => {
            console.log(error);
            toast.error(error.message || 'Something went wrong, try again');
             
        },
        onSuccess: (data) => {
            
        }
    });

    return mutation
}