import { templates } from '@/services/registration-template/registration-template';
import { TypedDocumentStep } from '@/types/step-hub';
import { PrismaClient } from '@prisma/client';


// Initialize Prisma client
const db = new PrismaClient();

async function createRegistrationTemplate(
    country: 'IN' | 'US',
    stepTemplates: TypedDocumentStep[]
) {
    try {
        const template = await db.$transaction(async (tx) => {
            // First create a single StepsHub for the country
            const registrationTemplate = await tx.registrationTemplate.create({
                data: {
                    country,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            // Then create all steps and connect them to the StepsHub
            const registrationSteps = await Promise.all(
                stepTemplates.map(async (template) => {
                    const {
                        title,
                        step: tempStep
                    } = template;
                    return tx.stepDefinition.create({
                        data: {
                            type: tempStep.type,
                            stepVersion: 1,
                            display: tempStep.display,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            step: {
                                create: {
                                    display: {
                                        title,
                                        subtitle: '',
                                    },
                                    options: {
                                        isDisabled: false,
                                        isOptional: false,
                                        isRecommended: false,
                                        isUpcoming: false,
                                        redirectURL: ''
                                    },
                                    isActive: false,
                                    status: 'not_started',
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                    template: {
                                        connect: {
                                            id: registrationTemplate.id
                                        }
                                    }
                                }
                            }
                        }
                    });
                })
            );

            return {
                registrationTemplate,
                registrationSteps
            };
        });

        return template;
    } catch (error) {
        console.error('Error creating step hub:', error);
        throw error;
    }
}

export async function seedTemplate() {
    try {
        console.log('🌱 Starting step seeding...');

        // Seed India steps
        const result = await createRegistrationTemplate('IN', Object.values(templates));

        console.log('✅ India steps seeded:', result);

        // Seed US steps (uncomment when US templates are ready)
        // const usResult = await stepService.createStepHub('US', Object.values(Template));
        // console.log('✅ US steps seeded:', usResult);

        console.log('✅ Step seeding completed');
    } catch (error) {
        console.error('❌ Error seeding steps:', error);
        throw error;
    }
}

// Run seed if this file is executed directly

seedTemplate()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
