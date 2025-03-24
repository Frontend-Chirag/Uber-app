'use client';

import { findEnumKey } from '@/lib/utils';
import { EventType, FieldType, FlowType, ScreenType } from '@/types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ScreenLoader } from '../screen-loader';

interface AuthFlowState {
    screenType: ScreenType;
    fieldType: FieldType[];
    eventType: EventType;
    flowType: FlowType;
    inAuthSessionID: string;
    hintValue: string;
    isLoadingNextScreen: boolean;
    profileHint: {
        firstname: string;
        lastname: string;
        email: string;
        phonenumber: string;
    }
}

interface AuthFlowContextProps extends AuthFlowState {
    setScreenType: (type: ScreenType) => void;
    setFieldType: (types: FieldType[]) => void;
    setEventType: (type: EventType) => void;
    setFlowType: (type: FlowType) => void;
    setInAuthSessionID: (id: string) => void;
    setHintValue: (value: string) => void;
    setIsLoadingNextScreen: (isLoading: boolean) => void;
    createFormData: (data: Record<FieldType, string>) => {
        flowType: FlowType;
        screenAnswers: {
            screenType: ScreenType;
            eventType: EventType;
            fieldAnswers: Array<{ fieldType: string;[key: string]: string }>;
        };
        inAuthSessionID: string;
    };
}

const AuthFlowContext = createContext<AuthFlowContextProps | null>(null);

const initialState: AuthFlowState = {
    screenType: ScreenType.PHONE_NUMBER_INITIAL,
    fieldType: [FieldType.EMAIL_ADDRESS],
    eventType: EventType.TypeInputEmail,
    flowType: FlowType.INITIAL,
    inAuthSessionID: '',
    hintValue: '',
    isLoadingNextScreen: false,
    profileHint: {
        firstname: '',
        lastname: '',
        email: '',
        phonenumber: ''
    }
};

export const AuthFlowProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<AuthFlowState>(initialState);

    const setters = useMemo(() => ({
        setScreenType: (screenType: ScreenType) => setState(prev => ({ ...prev, screenType })),
        setFieldType: (fieldType: FieldType[]) => setState(prev => ({ ...prev, fieldType })),
        setEventType: (eventType: EventType) => setState(prev => ({ ...prev, eventType })),
        setFlowType: (flowType: FlowType) => setState(prev => ({ ...prev, flowType })),
        setInAuthSessionID: (inAuthSessionID: string) => setState(prev => ({ ...prev, inAuthSessionID })),
        setHintValue: (hintValue: string) => setState(prev => ({ ...prev, hintValue })),
        setIsLoadingNextScreen: (isLoadingNextScreen: boolean) => setState(prev => ({ ...prev, isLoadingNextScreen })),
        setProfiileHint: (profileHint: {
            firstname: string;
            lastname: string;
            email: string;
            phonenumber: string;
        }) => setState(prev => ({ ...prev, profileHint }))
    }), []);


    const createFormData = useCallback((data: Record<FieldType, string>) => {
        return {
            flowType: state.flowType,
            screenAnswers: {
                screenType: state.screenType,
                eventType: state.eventType,
                fieldAnswers: Object.entries(data).map(([key, value]) => ({
                    fieldType: findEnumKey(key as FieldType) || key,
                    [key]: value
                }))
            },
            inAuthSessionID: state.inAuthSessionID
        };
    }, [state.flowType, state.screenType, state.eventType, state.inAuthSessionID]);

    const contextValue = useMemo(() => ({
        ...state,
        ...setters,
        createFormData
    }), [state, setters, createFormData]);

    return (
        <AuthFlowContext.Provider value={contextValue}>
            {state.isLoadingNextScreen ? (
                <ScreenLoader />
            ) : (
                children
            )}
        </AuthFlowContext.Provider>
    );
};

export const useAuthFlow = () => {
    const context = useContext(AuthFlowContext);
    if (!context) {
        throw new Error('useAuthFlow must be used within an AuthFlowProvider');
    }
    return context;
}
