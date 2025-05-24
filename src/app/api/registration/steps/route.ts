import { NextRequest, NextResponse } from 'next/server';
import { StepConfigService } from '@/services/steps/step-config-service';
import { StepStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country');

    if (!country) {
        return NextResponse.json(
            { error: 'Country is required' },
            { status: 400 }
        );
    }

    const stepService = StepConfigService.getInstance();
    const stepsHub = await stepService.getStepsHub(country);

    if (!stepsHub) {
        return NextResponse.json(
            { error: 'No steps configuration found for this country' },
            { status: 404 }
        );
    }

    return NextResponse.json(stepsHub);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { country, steps } = body;

        if (!country || !steps) {
            return NextResponse.json(
                { error: 'Country and steps are required' },
                { status: 400 }
            );
        }

        const stepService = StepConfigService.getInstance();
        const stepsHub = await stepService.createStepsHub(country, steps);

        return NextResponse.json(stepsHub);
    } catch (error) {
        console.error('Error creating steps:', error);
        return NextResponse.json(
            { error: 'Failed to create steps configuration' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const stepsHubId = searchParams.get('stepsHubId');
        const stepId = searchParams.get('stepId');
        const status = searchParams.get('status') as StepStatus;

        if (!stepsHubId || !stepId || !status) {
            return NextResponse.json(
                { error: 'stepsHubId, stepId, and status are required' },
                { status: 400 }
            );
        }

        if (!Object.values(StepStatus).includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status value' },
                { status: 400 }
            );
        }

        const stepService = StepConfigService.getInstance();
        const updatedStep = await stepService.updateStepStatus(
            stepsHubId,
            stepId,
            status
        );

        if (!updatedStep) {
            return NextResponse.json(
                { error: 'Step not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedStep);
    } catch (error) {
        console.error('Error updating step:', error);
        return NextResponse.json(
            { error: 'Failed to update step' },
            { status: 500 }
        );
    }
} 