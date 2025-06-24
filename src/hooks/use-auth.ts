import { client } from '@/server/rpc/hono-client';
import { InferRequestType, InferResponseType } from 'hono';
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner";
import { useRouter } from 'next/navigation'


type AuthRequest = InferRequestType<typeof client.api.auth.submit.$post>;
type AuthResponse = InferResponseType<typeof client.api.auth.submit.$post>;
type LogoutRequest = InferRequestType<typeof client.api.auth.logout.$post>;
type LogoutResponse = InferResponseType<typeof client.api.auth.logout.$post>;

export const useAuth = () => {
    const router = useRouter();

    const mutation = useMutation<AuthResponse, Error, AuthRequest>({
        mutationFn: async ({ json }) => {
            const response = await client.api.auth.submit.$post({ json });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Authentication failed', {
                    cause: errorData
                });
            }

            const data = await response.json();
            return data;
        },
        onError: (error) => {
            console.error('Auth error:', error);
            toast.error(error.message);
        },
        onSuccess: (data) => {
            const { error, redirectUrl, message } = data
            toast.success(message);
            if (error) {
                toast.error(data.error)
                router.refresh();
            }
            if (redirectUrl) {
                router.replace(redirectUrl);
            }
        }
    });

    return mutation;
}



export const useLogout = () => {
    const router = useRouter();

    const mutation = useMutation<LogoutResponse, Error, LogoutRequest>({
        mutationFn: async () => {
            const response = await client.api.auth.logout.$post();
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Logout failed', {
                    cause: errorData
                });
            }

            const data = await response.json();
            return data;
        },
        onError: (error) => {
            console.error('Logout error:', error);
            toast.error(error.message);
        },
        onSuccess: (data) => {
            router.replace(data.redirectUrl!)
            toast.success(data.message)
        }
    });

    return mutation;

}
