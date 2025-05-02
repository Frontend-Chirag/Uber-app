import { User } from '@/types/user'
import { Registration } from '@prisma/client'
import React from 'react'
import Link from 'next/link';
import { ChevronRightIcon } from 'lucide-react';

interface RegistrationStepsProps {
    User: User;
    Registration: Registration[];
}

export const RegistrationSteps = ({ User, Registration }: RegistrationStepsProps) => {

    console.log('registration',Registration)


    const steps = Registration.map(step => ({
        slug: step.type.toLowerCase(),
        name: step.display.title,
        status: step.status,
        isRecommended: step.options.isRecommended
    }));

    return (
        <div className='w-full h-full overflow-hidden overflow-y-auto'>
            <div className='mx-auto flex flex-col w-2/4 h-auto py-2'>
                <div className='flex flex-col gap-2.5'>
                    <h1 className='font-Rubik-Bold text-3xl'>Welcome, {User.firstname}</h1>
                    <p className='font-Rubik-Regular text-md'>Here's what you need to do to setup your account</p>
                </div>
                <div className='flex flex-col px-4'>
                    <div className='flex flex-col mt-10'>
                        {steps.map((step) => (
                            <Link
                                key={step.slug}
                                href={`/registration/${step.slug}`}
                                className={`w-full h-[70px] cursor-pointer flex justify-start items-start flex-col relative border-b border-b-neutral-200 pt-2 ${
                                    step.status === 'completed' ? 'text-green-600' : 'text-neutral-900 hover:text-neutral-400'
                                }`}
                            >
                                <p className='font-Rubik-Medium text-md'>{step.name}</p>
                                {step.isRecommended && step.status !== 'completed' && (
                                    <p className='font-Rubik-Regular text-blue-400 text-md'>Recommended next step</p>
                                )}
                                {step.status === 'completed' && (
                                    <p className='font-Rubik-Regular text-green-600 text-md'>Completed</p>
                                )}
                                <ChevronRightIcon
                                    className='absolute top-4 right-4 size-6'
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
