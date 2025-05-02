'use client';

import { findEnumKey } from '@/lib/utils';
import { EventType, FieldType, FlowType, ScreenType } from '@/types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ScreenLoader } from '../../components/shared/screen-loader';
import { Role } from '@prisma/client';


export interface FlowConfig {
    initialScreen: ScreenType;
    initialFieldTypes: FieldType[];
    initialEventType: EventType;
    initialFlowType: FlowType;
}

// Default flow configuration for different roles
export const FLOW_CONFIGS: Record<Role, FlowConfig> = {
    rider: {
        initialScreen: ScreenType.PHONE_NUMBER_INITIAL,
        initialFieldTypes: [FieldType.EMAIL_ADDRESS],
        initialEventType: EventType.TypeInputEmail,
        initialFlowType: FlowType.INITIAL
    },
    driver: {
        initialScreen: ScreenType.PHONE_NUMBER_INITIAL,
        initialFieldTypes: [FieldType.EMAIL_ADDRESS],
        initialEventType: EventType.TypeInputEmail,
        initialFlowType: FlowType.INITIAL
    },
    super_admin: {
        initialScreen: ScreenType.PHONE_NUMBER_INITIAL, 
        initialFieldTypes: [FieldType.EMAIL_ADDRESS, FieldType.PASSWORD],
        initialEventType: EventType.TypeInputEmail,
        initialFlowType: FlowType.INITIAL
    },
}

interface AuthFlowState {
    screenType: ScreenType;
    fieldType: FieldType[];
    eventType: EventType;
    flowType: FlowType;
    inAuthSessionId: string;
    hintValue: {
        emailorPhone: string;
        firstname?: string;
    };
    isLoadingNextScreen: boolean;
}

interface AuthFlowContextProps extends AuthFlowState {
    setScreenType: (type: ScreenType) => void;
    setFieldType: (types: FieldType[]) => void;
    setEventType: (type: EventType) => void;
    setFlowType: (type: FlowType) => void;
    setInAuthSessionId: (id: string) => void;
    setHintValue: (value: { emailorPhone: string, firstname?: string }) => void;
    setIsLoadingNextScreen: (isLoading: boolean) => void;
    createFormData: (data: Record<FieldType, string>) => {
        flowType: FlowType;
        screenAnswers: {
            screenType: ScreenType;
            eventType: EventType;
            fieldAnswers: Array<{ fieldType: string;[key: string]: string }>;
        };
        inAuthSessionId: string;
    };
    role: Role
}

const AuthFlowContext = createContext<AuthFlowContextProps | null>(null);

export const AuthFlowProvider = ({ children, role }: { children: ReactNode, role: Role }) => {

    // Get the appropriate flow configuration for the role
    const flowConfig = FLOW_CONFIGS[role] || FLOW_CONFIGS.rider;

    console.log(flowConfig)


    const [state, setState] = useState<AuthFlowState>({
        screenType: flowConfig.initialScreen,
        fieldType: flowConfig.initialFieldTypes,
        eventType: flowConfig.initialEventType,
        flowType: flowConfig.initialFlowType,
    inAuthSessionId: '',
    hintValue: {
       emailorPhone: ''
    },
    isLoadingNextScreen: false,
    });

    // Reset flow to inital state
    const resetFlow = useCallback(() => {
        setState({
            screenType: flowConfig.initialScreen,
            fieldType: flowConfig.initialFieldTypes,
            eventType: flowConfig.initialEventType,
            flowType: flowConfig.initialFlowType,
            inAuthSessionId: '',
            hintValue: {
                emailorPhone: ''
            },
            isLoadingNextScreen: false,
        })
    }, [flowConfig])

    const setters = useMemo(() => ({
        setScreenType: (screenType: ScreenType) => setState(prev => ({ ...prev, screenType })),
        setFieldType: (fieldType: FieldType[]) => setState(prev => ({ ...prev, fieldType })),
        setEventType: (eventType: EventType) => setState(prev => ({ ...prev, eventType })),
        setFlowType: (flowType: FlowType) => setState(prev => ({ ...prev, flowType })),
        setInAuthSessionId: (inAuthSessionId: string) => setState(prev => ({ ...prev, inAuthSessionId })),
        setHintValue: (hintValue: { emailorPhone: string, firstname?: string }) => setState(prev => ({ ...prev, hintValue })),
        setIsLoadingNextScreen: (isLoadingNextScreen: boolean) => setState(prev => ({ ...prev, isLoadingNextScreen })),
        resetFlow,
    }), [resetFlow]);


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
            inAuthSessionId: state.inAuthSessionId
        };
    }, [state.flowType, state.screenType, state.eventType, state.inAuthSessionId]);

    const contextValue = useMemo(() => ({
        ...state,
        ...setters,
        createFormData,
        role
    }), [state, setters, createFormData, role]);

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
