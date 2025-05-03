import { submit } from "@/actions/auth-actions";
import { AuthRequest, AuthResponse } from "@/services/auth/type";
import { Role } from "@prisma/client";
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner";
import {useRouter} from 'next/navigation'


export const useAuth = (role: Role) => {
    const router = useRouter();
    const mutation = useMutation<AuthResponse, Error, AuthRequest>({
        mutationFn: async (req) => {
            const response = await submit(req, role);

            if (response.error) {
                throw new Error(response.error)
            };

            console.log('response', response)

            return response;
        },
        onError: (error) => {
            toast.error('Something went wrong, try again');
            console.log(error);
        },
        onSuccess: (data) => {
            toast.success(data.message);
            if(data.redirectUrl){
              router.replace(`/${data.redirectUrl}`)
            }
        }
    });

    return mutation
}