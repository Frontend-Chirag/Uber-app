import { client } from "@/server/rpc/hono-client"
import { useQuery } from "@tanstack/react-query"
import { InferResponseType } from "hono";
import { toast } from "sonner";

type CurrentUserResponse = InferResponseType<typeof client.api.user.getCurrentUser.$get>;


export const useUserData = (enabled: boolean) => {
    const query = useQuery<CurrentUserResponse['data'], Error>({
        queryKey: ['FETCHCURRENTUSER'],
        queryFn: async () => {
            const response = await client.api.user.getCurrentUser.$get();
            if (!response.ok) {
                toast.error(response.statusText)
            }
            const { data } = await response.json();
            return data;
        },
        enabled

    })
    return query
}
