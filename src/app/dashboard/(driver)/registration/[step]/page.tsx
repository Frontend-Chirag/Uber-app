
interface StepProps {
    params: Promise<{ step: string }>
}


export default async function Step({ params }: StepProps) {

    const { step } = await params;

    return (
        <div>{step}</div>
    )
}

