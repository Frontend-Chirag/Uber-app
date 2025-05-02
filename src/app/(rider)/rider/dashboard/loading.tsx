import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="w-full h-full p-6">
            <div className="flex flex-col gap-4">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex flex-col gap-2 p-4 border rounded-lg">
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-[80px]" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}