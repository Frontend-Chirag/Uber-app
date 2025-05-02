import { Skeleton } from "@/components/ui/skeleton";

export default function RegistrationLoading() {
    return (
        <div className="w-full h-full overflow-hidden overflow-y-auto">
            <div className="mx-auto flex flex-col w-2/4 h-auto py-2">
                <div className="flex flex-col gap-2.5">
                    <Skeleton className="h-9 w-[200px]" />
                    <Skeleton className="h-5 w-[300px]" />
                </div>
                <div className="flex flex-col px-4">
                    <div className="flex flex-col mt-10">
                        {[...Array(7)].map((_, i) => (
                            <div
                                key={i}
                                className="w-full h-[70px] flex justify-start items-start flex-col relative border-b border-b-neutral-200 pt-2"
                            >
                                <Skeleton className="h-5 w-[200px]" />
                                {i === 0 && <Skeleton className="h-5 w-[150px] mt-1" />}
                                <Skeleton className="absolute top-4 right-4 h-6 w-6" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}