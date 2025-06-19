import { client } from '@/server/rpc/hono-client';
import { InferRequestType, InferResponseType } from 'hono';
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner";
import { useRouter } from 'next/navigation'
import { FlowType, ScreenType, EventType } from '@/types';
import { authUserSession } from '@/server/services/auth/auth-service';
import { EmailParams, sendOTPEmail } from '@/server/services/email';
import { OTP } from '@/server/services/security/otp';
import { sendSMSMobile, SMSParams } from '@/server/services/sms';

type AuthRequest = InferRequestType<typeof client.api.auth.submit.$post>;
type AuthResponse = InferResponseType<typeof client.api.auth.submit.$post>;

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
            const { error, redirectUrl } = data
            if (error) {
                toast.error(data.error)
                router.refresh();
            }
            if (redirectUrl) {
                router.push(redirectUrl);
            }
        }
    });

    return mutation;
}
