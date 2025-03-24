"use client";

import React, { createContext, useContext, useMemo, useState } from 'react';
import { User } from '@prisma/client';
import { ScreenLoader } from './screen-loader';


interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

interface AuthContextProps extends AuthState {
    setUser: (user: User) => void;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    setIsLoading: (isLoading: boolean) => void;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider = ({children}: {children: React.ReactNode}) => {

    const [state, setState] = useState<AuthState>(initialState);

    const setters = useMemo(() => ({
        setUser: (user: User) => setState(prev => ({ ...prev, user })),
        setIsAuthenticated: (isAuthenticated: boolean) => setState(prev => ({ ...prev, isAuthenticated })),
        setIsLoading: (isLoading: boolean) => setState(prev => ({ ...prev, isLoading }))
    }), [])


    const contextValue = useMemo(() => ({
        ...state,
        ...setters
    }), [state, setters]);

    return (
        <AuthContext.Provider value={contextValue}>
          {state.isLoading ? <ScreenLoader/> : children}
        </AuthContext.Provider>
    )
};


export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context){
        throw new Error('useAuthFlow must be used within an AuthFlowProvider');
    }
    return context;
}
