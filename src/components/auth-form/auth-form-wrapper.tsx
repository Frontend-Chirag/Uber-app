"use client";
// import { Separator } from '@/components/ui/separator';
import { useAuthFlow } from '@/components/auth-form/auth-flow-provider';
import { FlowType, ScreenType } from '@/types';
import termsAndConditionSvg from '@/assets/photos/termsAndConditions.png';
import React, { useMemo } from 'react';

// Add these types at the top
type TitleConfig = {
    title: string;
    className: string;
    wrapper?: boolean;
};

type TitleFunction = (hintValue: string) => TitleConfig;

type ScreenTitlesConfig = {
    [K in ScreenType | ScreenType.PHONE_NUMBER_INITIAL]: TitleFunction;
};

interface AuthWrapper {
    children: React.ReactNode;
}

// Define screen title configurations
const SCREEN_TITLES: ScreenTitlesConfig = {
    [ScreenType.EMAIL_OTP_CODE]: (hintValue: string) => ({
        title: `Enter the 4-digit code sent to: ${hintValue}`,
        className: "text-2xl font-Rubik-SemiBold"
    }),

    [ScreenType.PHONE_OTP]: (hintValue: string) => ({
        title: `Enter the 4-digit code sent via SMS to: ${hintValue}`,
        className: "text-2xl font-Rubik-SemiBold"
    }),

    [ScreenType.EMAIL_ADDRESS_PROGESSIVE]: () => ({
        title: "Enter your Email address (optional)",
        className: "text-2xl font-Rubik-SemiBold"
    }),

    [ScreenType.PHONE_NUMBER_PROGRESSIVE]: () => ({
        title: "Enter your Phone number (optional)",
        className: "text-2xl font-Rubik-SemiBold"
    }),

    [ScreenType.FIRST_NAME_LAST_NAME]: () => ({
        title: "Let us know how to properly address you",
        className: "text-2xl font-Rubik-SemiBold"
    }),

    [ScreenType.AGREE_TERMS_AND_CONDITIONS]: () => ({
        title: "Accept Uber's Terms & Review Privacy Notice",
        className: "text-2xl font-Rubik-SemiBold",
        wrapper: true
    }),
    [ScreenType.PHONE_NUMBER_INITIAL]:  () => ({
          title: "What's your phone number or email?",
        className: "text-2xl font-Rubik-SemiBold"
    }),
    [ScreenType.EMAIL_ADDRESS]: function (hintValue: string): TitleConfig {
        throw new Error('Function not implemented.');
    },
    [ScreenType.RESET_ACCOUNT]: function (hintValue: string): TitleConfig {
        throw new Error('Function not implemented.');
    }
} ;

export const TitleContainer = () => {
    const { screenType, hintValue } = useAuthFlow();

    // Memoize the title configuration
    const titleConfig = useMemo(() => {
        const getTitle = SCREEN_TITLES[screenType] ;
        return getTitle(hintValue);
    }, [screenType, hintValue]);

    return (
        <h1 className={titleConfig.className}>
            {titleConfig.title}
        </h1>
    );
};

export const AuthFormWrapper = ({ children }: AuthWrapper) => {
    const { flowType } = useAuthFlow();
    const isInitial = flowType === FlowType.INITIAL;

    // Memoize the initial content
    const initialContent = useMemo(() => {
        if (!isInitial) return null;

        return (
            <>
                <div className="w-full flex justify-center items-center gap-x-2.5 py-1" />
                <p className="text-sm text-[#6B6B6B] font-rubik-normal mt-8">
                    By proceeding, you consent to get calls, WhatsApp, or SMS/RCS messages, including by
                    automated means, from Uber and its affiliates to the number provided.
                </p>
            </>
        );
    }, [isInitial]);

    return (
        <div className="mx-auto flex flex-col gap-y-3 w-full sm:w-[370px] px-4 sm:px-0">
            <div className='flex flex-col gap-y-8 mt-6'>
                <TitleContainer />
            </div>
            {children}
            {initialContent}
        </div>
    );
};
