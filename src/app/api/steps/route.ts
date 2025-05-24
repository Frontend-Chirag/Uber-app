import { NextRequest, NextResponse } from "next/server";
import { stepConfigService } from "@/services/steps/step-config-service";
import { countryStepsService } from "@/services/steps/country-steps-service";
import { StepType } from "@prisma/client";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country');
    const stepType = searchParams.get('type') as StepType | null;

    try {
        if (country && stepType) {
            // Get specific step config for a country
            const config = countryStepsService.getStepConfigForCountry(country, stepType);
            if (!config) {
                return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
            }
            return NextResponse.json(config);
        }

        if (country) {
            // Get all steps for a country
            const steps = countryStepsService.getOrderedStepsForCountry(country);
            return NextResponse.json(steps);
        }

        // Get all country configurations
        const configs = countryStepsService.getAllCountryConfigs();
        return NextResponse.json(configs);
    } catch (error) {
        console.error('Error fetching step configurations:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { country, steps } = body;

        if (!country || !steps) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        countryStepsService.addCountryConfig({ country, steps });
        return NextResponse.json({ message: 'Configuration added successfully' });
    } catch (error) {
        console.error('Error adding step configuration:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { country, steps } = body;

        if (!country) {
            return NextResponse.json({ error: 'Country is required' }, { status: 400 });
        }

        countryStepsService.updateCountryConfig(country, { steps });
        return NextResponse.json({ message: 'Configuration updated successfully' });
    } catch (error) {
        console.error('Error updating step configuration:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 