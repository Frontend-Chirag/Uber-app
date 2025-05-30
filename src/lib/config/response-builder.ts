import { EventType, FlowType, ScreenType } from "@/types";
import { Admin, User } from "@prisma/client";


export interface Fields {
    fieldType: string;
    hintValue?: string;
    profileHint?: {
        firstname: string,
        lastname: string,
        phonenumber: string,
        email: string
    } | null;
    otpWidth?: number;
};

export interface AuthResponseForm {
    flowType: FlowType;
    screens: {
        screenType: ScreenType;
        fields: Fields[];
        eventType: EventType;
    }
    inAuthSessionId: string;
}


export class AuthResponseBuilder {
    private response: {
        status: number;
        error?: string;
        success: boolean;
        user?: User | Admin;
        form?: AuthResponseForm;
        redirectUrl?: string;
        message?: string
    };

    constructor() {
        this.response = { status: 200, success: true };
    }

    setStatus(status: number) {
        this.response.status = status;
        return this;
    }

    setError(error: string) {
        this.response.error = error;
        this.response.status = 400;
        return this;
    }

    setSuccess(success: boolean) {
        this.response.success = success;
        return this;
    }

    setUser(user: User | Admin) {
        this.response.user = user;
        return this;
    }

    setForm(formdata: AuthResponseForm) {
        this.response.form = formdata;
        return this;
    }

    setRedirect(url: string) {
        this.response.redirectUrl = url;
        return this;
    }

    setMessage(message: string) {
        this.response.message = message
        return this
    }

    build() {
        return this.response;
    }
}