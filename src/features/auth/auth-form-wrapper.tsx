"use client";
// import { Separator } from '@/components/ui/separator';
import { useAuthFlow } from '@/features/auth/auth-flow-provider';
import { EventType, FieldType, FlowType, ScreenType } from '@/types';
import termsAndConditionSvg from '@/assets/photos/termsAndConditions.png';
import React, { useMemo } from 'react';
import { Role } from '@prisma/client';

// ===== TYPES =====
type TitleConfig = {
    title: string;
    subtitle?: string;
    className?: string;
    wrapper?: boolean;
};


type ScreenConfig = {
    title: string | ((hintValue: { emailorPhone: string, firstname?: string }) => string);
    subtitle?: string | ((hintValue: { emailorPhone: string, firstname?: string }) => string);
    className?: string;
    wrapper?: boolean;
};

type ScreenConfigs = {
    [S in ScreenType]?: ScreenConfig;
};

interface AuthWrapperProps {
    children: React.ReactNode;
    className?: string;
}

// ===== CONSTANTS =====
const DEFAULT_TITLE_CLASS = "text-2xl font-Rubik-SemiBold";
const DEFAULT_SUBTITLE_CLASS = "text-base font-normal mt-0.5";

const SCREEN_CONFIGS: ScreenConfigs = {
    [ScreenType.EMAIL_OTP_CODE]: {
        title: (hintValue) => hintValue.firstname
            ? `Welcome back, ${hintValue.firstname}`
            : `Enter the 4-digit code sent to: ${hintValue.emailorPhone}`,
        subtitle: (hintValue) => `Enter the 4-digit code sent to your email: ${hintValue.emailorPhone}`,
        className: DEFAULT_TITLE_CLASS
    },
    [ScreenType.PHONE_OTP]: {
        title: (hintValue) => hintValue.firstname
            ? `Welcome back, ${hintValue.firstname}`
            : `Enter the 4-digit code sent via SMS to: ${hintValue.emailorPhone}`,
        subtitle: (hintValue) => `Enter the 4-digit code sent to your your phone number: ${hintValue.emailorPhone}`,
        className: DEFAULT_TITLE_CLASS
    },
    [ScreenType.EMAIL_ADDRESS_PROGESSIVE]: {
        title: "Enter your Email address (optional)",
        className: DEFAULT_TITLE_CLASS
    },
    [ScreenType.PHONE_NUMBER_PROGRESSIVE]: {
        title: "Enter your Phone number (optional)",
        className: DEFAULT_TITLE_CLASS
    },
    [ScreenType.FIRST_NAME_LAST_NAME]: {
        title: "Let us know how to properly address you",
        className: DEFAULT_TITLE_CLASS
    },
    [ScreenType.AGREE_TERMS_AND_CONDITIONS]: {
        title: "Accept Uber's Terms & Review Privacy Notice",
        className: DEFAULT_TITLE_CLASS,
        wrapper: true
    },
    [ScreenType.PHONE_NUMBER_INITIAL]: {
        title: "What's your phone number or email?",
        className: DEFAULT_TITLE_CLASS
    }
};

// ===== UTILITIES =====
const getTitleConfig = (
    screenType: ScreenType,
    hintValue: { emailorPhone: string, firstname?: string }
): TitleConfig | null => {
    const config = SCREEN_CONFIGS[screenType];
    if (!config) return null;

    const title = typeof config.title === 'function'
        ? config.title(hintValue)
        : config.title;

    const subtitle = config.subtitle
        ? (typeof config.subtitle === 'function'
            ? config.subtitle(hintValue)
            : config.subtitle)
        : undefined;

    return {
        title,
        subtitle,
        className: config.className || DEFAULT_TITLE_CLASS,
        wrapper: config.wrapper
    };
};

// ===== COMPONENTS =====
const TitleContainer = () => {
    const { screenType, hintValue, eventType } = useAuthFlow();

    const isExistingUser = eventType === EventType.TypeInputExistingEmail ||
        eventType === EventType.TypeInputExistingPhone;

    const titleConfig = useMemo(() =>
        getTitleConfig(screenType, hintValue),
        [screenType, hintValue]
    );

    console.log(titleConfig)

    if (!titleConfig) return null;

    return (
        <div className='flex flex-col gap-1.5 mb-1.5'>
            <h1 className={titleConfig.className}>{titleConfig.title}</h1>
            {titleConfig.subtitle && (
                <p className={DEFAULT_SUBTITLE_CLASS}>{titleConfig.subtitle}</p>
            )}
        </div>
    )
};

const ConsentNotice = () => (
    <>
        <div className="w-full flex justify-center items-center gap-x-2.5 py-1" />
        <p className="text-sm text-[#6B6B6B] font-rubik-normal mt-8">
            By proceeding, you consent to get calls, WhatsApp, or SMS/RCS messages, including by
            automated means, from Uber and its affiliates to the number provided.
        </p>
    </>
);

export const AuthFormWrapper = ({
    children,
    className = "mx-auto flex flex-col gap-y-3 w-full sm:w-[370px] px-4 sm:px-0"
}: AuthWrapperProps) => {
    const { flowType } = useAuthFlow();
    const isInitial = flowType === FlowType.INITIAL;

    return (
        <div className={className}>
            <div className='flex flex-col gap-y-8 mt-6'>
                <TitleContainer />
            </div>
            {children}
            {isInitial && <ConsentNotice />}
        </div>
    );
};
