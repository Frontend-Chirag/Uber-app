"use client";

import { useAuthFlow } from '@/components/auth-form/auth-flow-provider';
import { useEffect, useState, useCallback, useMemo, memo } from 'react'
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FlowType, FieldType, ScreenType, EventType } from '@/types';
import * as z from 'zod';
import { FieldValidationSchema } from '@/components/fieldConfig';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { formatTime, phoneCountryCodes } from '@/lib/constants';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubmit } from '@/features/auth/api/auth-api';


export interface OtpSectionProps {
    isSignup: boolean;
    isLogin: boolean;
    isFirstNameLastName: boolean;
    timeLeft: number;
    isCompleted: boolean;
    onResend: () => void;
}

export interface FormButtonProps {
    isInitial: boolean;
    isValid: boolean;
    isSubmitting: boolean;
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

    const isDriver = true;

    const {
        flowType,
        fieldType,
        inAuthSessionID,
        screenType,
        eventType,
        setIsLoadingNextScreen,
        setInAuthSessionID,
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

    const { mutateAsync, data: resData, isPending } = useSubmit();

    const [timeLeft, setTimeLeft] = useState(15);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleResendOtp = useCallback(() => {
        setTimeLeft(15);
        // toast.success('A new OTP has been sent!');
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
                ? phoneCountryCodes[0].code
                : "";
            return values;
        }, {} as Record<FieldType, string>)
        , [fieldType]);

    const form = useForm({
        resolver: zodResolver(dynamicSchema),
        defaultValues
    });

    const findEnumKey = (value: string): keyof typeof FieldType | undefined => {
        return Object.keys(FieldType).find(
            (key) => FieldType[key as keyof typeof FieldType] === value
        ) as keyof typeof FieldType | undefined;
    };
    const onSubmit = useCallback(async (data: Record<FieldType, string>) => {

        mutateAsync({
            json: {
                flowType,
                screenAnswers: {
                    screenType,
                    eventType,
                    fieldAnswers: Object.entries(data).map(([key, value]) => {
                        const fieldType = findEnumKey(key); // Get enum key from value
                        if (!fieldType) {
                            throw new Error(`Invalid fieldType for key: ${key}`);
                        }
                        return { fieldType, [key]: value ?? null }; // Ensure correct field mapping
                    })
                },
                inAuthSessionID
            }
        });





        // try {
        //     setIsLoadingNextScreen(true);
        //     const { data: { data: responseData } } = await handleSubmitForm(formData, isDriver);
        //     if (responseData.role) {
        //         setUser(responseData);
        //         setIsAuthenticated(true);
        //         // toast.success('Logged in successfully');
        //     } else {
        //         const { form: { flowType, screens: { screenType, fields, eventType } }, inAuthSessionID } = responseData;
        //         setFlowType(flowType);
        //         setScreenType(screenType);
        //         const reverseFieldTypeMap = new Map(
        //             Object.entries(FieldType).map(([key, value]) => [key, value])
        //         );
        //         console.log(reverseFieldTypeMap)
        //         setFieldType(fields.map((field: any) => reverseFieldTypeMap.get(field.fieldType) ?? field.fieldType));
        //         setHintValue(fields[0]?.hintValue)
        //         setEventType(eventType)
        //         setInAuthSessionID(inAuthSessionID);
        //     }
        // } catch (error) {
        //     console.log(error);
        // } finally {
        //     form.reset();
        //     setIsLoadingNextScreen(false);
        // }
    }, [flowType, screenType, eventType, inAuthSessionID, isDriver, setIsLoadingNextScreen, setFlowType, setScreenType, setFieldType, setHintValue, setEventType, setInAuthSessionID]);

    return (
        <FormProvider {...form}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='w-full flex flex-col'>
                    {children}
                    <OtpSection
                        isSignup={isSignup}
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
                    />
                </form>
            </Form>
        </FormProvider>
    );
}

AuthForm.displayName = 'AuthForm';



const FormButton = memo(({ isInitial, isValid, isSubmitting }: FormButtonProps) => {
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
        <div className='flex justify-between items-center mt-8'>
            <Button
                onClick={() => { }}
                size='icon'
                type='button'
                variant='ghost'
                className='rounded-full hover:bg-white'
            >
                {/* {iconName
                    ? iconName
                    : <ArrowLeftIcon className='size-6' />
                } */}
            </Button>
            <Button
                onClick={() => { }}
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
    onResend
}: OtpSectionProps) => {
    if (!(isSignup || isLogin) || isFirstNameLastName) return null;

    return (
        <div className='flex flex-col gap-y-4'>
            <p className="text-sm text-neutral-400 font-Rubik-Normal mt-2">
                Tip: Make sure to check your inbox and spam folders.
            </p>
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
        </div>
    );
});

OtpSection.displayName = 'OtpSection';
