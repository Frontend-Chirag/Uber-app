"use client";

import { useAuthFlow } from '@/features/auth/auth-flow-provider';
import { useEffect, useState, useCallback, useMemo, memo } from 'react'
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FlowType, FieldType, ScreenType, EventType } from '@/types';
import * as z from 'zod';
import { FieldValidationSchema } from '@/validators/validate-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { formatTime, phoneCountryCodes } from '@/lib/constants';
import { ArrowLeftIcon, ArrowRightIcon, LoaderCircle } from 'lucide-react';
import { cn, findEnumKey } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';


const OTP_RESEND_TIMEOUT = 15; // seconds 

export interface OtpSectionProps {
    isSignup: boolean;
    isLogin: boolean;
    isFirstNameLastName: boolean;
    timeLeft: number;
    isCompleted: boolean;
    isResendOtp: boolean;
    onResend: () => void;
}

export interface FormButtonProps {
    isInitial: boolean;
    isValid: boolean;
    isProgressive: boolean;
    isSubmitting: boolean;
    onBack?: () => void;
    onSkip?: () => void;
}

export interface AuthFormData {
    flowType: FlowType;
    screenAnswers: {
        screenType: ScreenType;
        eventType: EventType;
        fieldAnswers: Array<{
            fieldType: string;
            [key: string]: string;
        }>;
    };
    inAuthSessionID: string;
}


export const AuthForm = ({ children }: { children: React.ReactNode }) => {

    const router = useRouter();
    const {
        flowType,
        fieldType,
        inAuthSessionId,
        screenType,
        eventType,
        setIsLoadingNextScreen,
        setInAuthSessionId,
        setHintValue,
        setFlowType,
        setEventType,
        setFieldType,
        setScreenType
    } = useAuthFlow();

    const isSignup = flowType === FlowType.SIGN_UP;
    const isLogin = flowType === FlowType.LOGIN;
    const isInital = flowType === FlowType.INITIAL;
    const isFirstNameLastName = screenType === ScreenType.FIRST_NAME_LAST_NAME;
    const isProgressive = flowType === FlowType.PROGRESSIVE_SIGN_UP &&
        (screenType === ScreenType.EMAIL_ADDRESS_PROGESSIVE ||
            screenType === ScreenType.PHONE_NUMBER_INITIAL);

    const { mutateAsync, isPending } = useAuth()


    const [timeLeft, setTimeLeft] = useState(OTP_RESEND_TIMEOUT);
    const [isCompleted, setIsCompleted] = useState(false);



    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);


    const handleResendOtp = useCallback(() => {

        mutateAsync({
            json: {
                flowType: FlowType.SIGN_UP,
                screenAnswers: {
                    eventType: eventType,
                    fieldAnswers: [],
                    screenType: ScreenType.RESEND_OTP
                },
                inAuthSessionId
            }
        });
        setTimeLeft(15);
    }, []);

    const dynamicSchema = useMemo(() =>
        z.object(fieldType.reduce((schema, field) => {
            schema[field] = FieldValidationSchema[field];
            return schema;
        }, {} as Record<FieldType, z.ZodTypeAny>))
        , [fieldType]);


    const defaultValues = useMemo(() =>
        fieldType.reduce((values, field) => {
            values[field] = field === FieldType.PHONE_COUNTRY_CODE
                ? phoneCountryCodes[0]?.code
                : "";
            return values;
        }, {} as Record<FieldType, string>)
        , [fieldType]);


    const form = useForm({
        resolver: zodResolver(dynamicSchema),
        defaultValues
    });

    const handleSkip = useCallback(() => {
        setIsLoadingNextScreen(true);
        // Skip the current step in progressive signup
        if (isProgressive) {
            setScreenType(ScreenType.FIRST_NAME_LAST_NAME)
            setFieldType([
                FieldType.FIRST_NAME,
                FieldType.LAST_NAME
            ])
            setEventType(EventType.TypeInputDetails)
        }
        setIsLoadingNextScreen(false);
    }, [isProgressive]);

    const handleBack = useCallback(() => {
        // Go back to the previous step
        setIsLoadingNextScreen(true);
        if (!isProgressive) {
            router.refresh();
        }
        setIsLoadingNextScreen(false);
    }, [isProgressive]);


    const onSubmit = useCallback(async (formdata: Record<FieldType, string>) => {
        try {
            setIsLoadingNextScreen(true);
            const response = await mutateAsync({
                json: {
                    flowType,
                    screenAnswers: {
                        screenType,
                        eventType,
                        fieldAnswers: Object.entries(formdata).map(([key, value]) => {
                            const fieldType = findEnumKey(key); // Get enum key from value
                            if (!fieldType) {
                                throw new Error(`Invalid fieldType for key: ${key}`);
                            }
                            return { fieldType, [key]: value ?? null }; // Ensure correct field mapping
                        }),
                    },
                    inAuthSessionId
                }
            });

            if (!response.error && response.form) {
                const { inAuthSessionId, flowType, screens: { eventType, fields, screenType } } = response.form;

                setInAuthSessionId(inAuthSessionId);
                setFlowType(flowType);
                setEventType(eventType);
                const reverseFieldTypeMap = new Map(
                    Object.entries(FieldType).map(([key, value]) => [key, value])
                );
                setFieldType(fields.map((field: any) => reverseFieldTypeMap.get(field.fieldType) ?? field.fieldType));
                setScreenType(screenType);
                setHintValue({ emailorPhone: fields[0].hintValue!, firstname: fields[0].profileHint?.firstname! });
            }
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            form.reset();
            setIsLoadingNextScreen(false);
        }
    }, [flowType, screenType, eventType, inAuthSessionId, setIsLoadingNextScreen, setFlowType, setScreenType, setFieldType, setHintValue, setEventType, setInAuthSessionId, form, mutateAsync]);

    return (
        <FormProvider {...form}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='w-full flex flex-col justify-between gap-3.5'>
                    {children}
                    <OtpSection
                        isSignup={isSignup}
                        isResendOtp={isPending}
                        isLogin={isLogin}
                        isFirstNameLastName={isFirstNameLastName}
                        timeLeft={timeLeft}
                        isCompleted={isCompleted}
                        onResend={handleResendOtp}
                    />
                    <FormButton
                        isInitial={isInital}
                        isValid={form.formState.isValid}
                        isSubmitting={form.formState.isSubmitting}
                        isProgressive={isProgressive}
                        onBack={handleBack}
                        onSkip={handleSkip}
                    />
                </form>
            </Form>
        </FormProvider>
    );
}

AuthForm.displayName = 'AuthForm';



const FormButton = memo(({ isInitial, isValid, isSubmitting, isProgressive, onSkip, onBack }: FormButtonProps) => {

    if (isInitial) {
        return (
            <Button
                type="submit"
                className="h-14 text-lg font-normal mt-4 rounded-lg"
                disabled={isSubmitting}
            >
                Continue
            </Button>
        );
    }


    return (
        <div className='flex justify-between items-center '>
            <Button
                onClick={isProgressive ? onSkip : onBack}
                size='icon'
                type='button'
                variant='ghost'
                className='rounded-full hover:bg-white'
            >
                {isProgressive ? 'Skip' : <ArrowLeftIcon className='size-6' />}
            </Button>
            <Button
                disabled={!isValid || isSubmitting}
                type={'submit'}
                className={cn('w-fit flex justify-center px-4 py-2 items-center font-bold text-md rounded-full disabled:bg-neutral-500 disabled:text-black disabled:cursor-not-allowed bg-primary text-white'
                )}
            >
                Next <ArrowRightIcon className='ml-2 size-6' />
            </Button>
        </div>
    );
});

FormButton.displayName = 'FormButton';

const OtpSection = memo(({
    isSignup,
    isLogin,
    isFirstNameLastName,
    timeLeft,
    isCompleted,
    isResendOtp,
    onResend
}: OtpSectionProps) => {
    if (!(isSignup || isLogin) || isFirstNameLastName) return null;

    return (
        <div className='flex flex-col gap-y-4'>
            <p className="text-sm text-neutral-400 font-Rubik-Normal mt-2">
                Tip: Make sure to check your inbox and spam folders.
            </p>
            {isResendOtp
                ? <LoaderCircle className='animate-spin size-1' />
                :
                <Button
                    disabled={timeLeft > 0 || isCompleted}
                    onClick={onResend}
                    variant="ghost"
                    className="w-fit px-4 py-2 text-md font-Rubik-SemiBold bg-neutral-100 rounded-full"
                >

                    {timeLeft <= 0 ? (
                        <p className="text-primary">Resend code via SMS</p>
                    ) : (
                        <p className="text-gray-500">
                            I haven't received a code {`(${formatTime(timeLeft)})`}
                        </p>
                    )}
                </Button>
            }

        </div >
    );
});

OtpSection.displayName = 'OtpSection';
// https://d1a3f4spazzrp4.cloudfront.net/web-onboarding/images/onboarding_sample_images/Global/profile_photo_global.png
// https://d1a3f4spazzrp4.cloudfront.net/web-onboarding/images/auto_fetch/ind_drivers_license_input_sample_image.png
// https://d1a3f4spazzrp4.cloudfront.net/web-onboarding/images/auto_fetch/india_aadhaa_card_sample_image.png
// https://d1a3f4spazzrp4.cloudfront.net/web-onboarding/images/auto_fetch/india_pan_card_sample_image.png