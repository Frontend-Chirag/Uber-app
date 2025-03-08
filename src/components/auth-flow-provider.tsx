'use client';

import { findEnumKey } from '@/lib/utils';
import { EventType, FieldType, FlowType, ScreenType } from '@/types';
import React, { SetStateAction, createContext, useContext, useState } from 'react'


interface AuthFlowContextProps {
    screenType: ScreenType;
    setScreenType: React.Dispatch<SetStateAction<ScreenType>>;
    fieldType: FieldType[];
    setFieldType: React.Dispatch<SetStateAction<FieldType[]>>;
    eventType: EventType;
    setEventType: React.Dispatch<SetStateAction<EventType>>
    flowType: FlowType;
    setFlowType: React.Dispatch<SetStateAction<FlowType>>;
    inAuthSessionID: string;
    setInAuthSessionID: React.Dispatch<SetStateAction<string>>;
    hintValue: string;
    setHintValue: React.Dispatch<SetStateAction<string>>;
    isLoadingNextScreen: boolean;
    setIsLoadingNextScreen: React.Dispatch<SetStateAction<boolean>>;
    createFormData: (data: Record<FieldType, string>) => void;
}

const AuthFlowContext = createContext<AuthFlowContextProps | null>(null);


export const AuthFlowProvider = ({ children }: { children: React.ReactNode }) => {

    const [screenType, setScreenType] = useState<ScreenType>(ScreenType.PHONE_NUMBER_INITIAL);
    const [eventType, setEventType] = useState<EventType>(EventType.TypeInputEmail);
    const [fieldType, setFieldType] = useState<FieldType[]>([FieldType.EMAIL_ADDRESS]);
    const [flowType, setFlowType] = useState<FlowType>(FlowType.INITIAL);
    const [inAuthSessionID, setInAuthSessionID] = useState('');
    const [hintValue, setHintValue] = useState('')

    const [isLoadingNextScreen, setIsLoadingNextScreen] = useState(false);


    const createFormData = (data: Record<FieldType, string>) => {
        return {
            flowType,
            screenAnswers: {
                screenType,
                eventType,
                fieldAnswers: Object.entries(data).map(([key, value]) => {
                    return { fieldType: findEnumKey(key as FieldType), [key]: value }
                })
            },
            inAuthSessionID
        }
    }

    return (
        <AuthFlowContext.Provider
            value={{
                screenType,
                setScreenType,
                fieldType,
                setFieldType,
                eventType,
                setEventType,
                flowType,
                setFlowType,
                inAuthSessionID,
                setInAuthSessionID,
                hintValue,
                setHintValue,
                isLoadingNextScreen,
                setIsLoadingNextScreen,
                createFormData
            }}
        >
            {children}
        </AuthFlowContext.Provider>
    )
};


export const useAuthFlow = () => {
    const context = useContext(AuthFlowContext);
    if (context === null) {
        throw new Error('useAuthFlow must be used within an AuthFlowProvider');
    }
    return context;
}
