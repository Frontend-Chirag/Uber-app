"use client";

import { useAuthFlow } from "@/components/auth-form/auth-flow-provider";
import { AuthForm } from "./auth-form";
import { AuthFormFields } from "./auth-form-fields";
import { AuthFormWrapper } from "./auth-form-wrapper";
import { ScreenLoader } from "@/components/screen-loader";


export const AuthFormLayout = () => {

    const { isLoadingNextScreen } = useAuthFlow();

    const FinalScreen = isLoadingNextScreen ? ScreenLoader : AuthFormWrapper;

    return (
        <FinalScreen>
            <AuthForm >
                <AuthFormFields />
            </AuthForm>
        </FinalScreen>
    )
}
