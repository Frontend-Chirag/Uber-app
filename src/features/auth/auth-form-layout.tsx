"use client";

import { useAuthFlow } from "@/features/auth/auth-flow-provider";
import { AuthForm } from "./auth-form";
import { AuthFormFields } from "./auth-form-fields";
import { AuthFormWrapper } from "./auth-form-wrapper";
import { ScreenLoader } from "@/components/shared/screen-loader";


export const AuthFormLayout = () => {

    const { isLoadingNextScreen } = useAuthFlow();

    const FinalScreen = isLoadingNextScreen ? ScreenLoader : AuthFormWrapper;

    return (
        <FinalScreen>
            <AuthForm  >
                <AuthFormFields />
            </AuthForm>
        </FinalScreen>
    )
}
