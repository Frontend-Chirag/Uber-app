import { HTTP_STATUS } from "@/lib/constants";
import { FlowType, ScreenType, EventType } from "@/types";
import { ContentfulStatusCode } from "hono/utils/http-status";

// ------------------------------------------------------------Base Response Builder----------------------------------------------------------

type BaseResponse = {
    status: ContentfulStatusCode;
    error?: string;
    success: boolean;
    message?: string;
}

export class BaseResponseBuilder<T extends BaseResponse = BaseResponse> {
    protected response: Partial<T> = {
        success: true,
        status: HTTP_STATUS.OK
    } as Partial<T>

    public setStatus(status: ContentfulStatusCode): this {
        this.response.status = status;
        this.response.success = status >= 200 && status < 300;
        return this;
    }

    public setError(error: string): this {
        this.response.error = error;
        return this;
    }

    public setSuccess(success: boolean): this {
        this.response.success = success;
        return this;
    }

    public setMessage(message: string): this {
        this.response.message = message;
        return this;
    }

    public build(): T {
        return this.response as T;
    }
}


// ------------------------------------------------------------Auth Response Builder----------------------------------------------------------

interface AuthFields {
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

export type AuthResponse = BaseResponse & {
    form?: {
        flowType: FlowType;
        screens: {
            screenType: ScreenType;
            fields: AuthFields[];
            eventType: EventType;
        }
        inAuthSessionId: string;
    }
    redirectUrl?: string;
}

export class AuthResponseBuilder extends BaseResponseBuilder<AuthResponse> {
    constructor() {
        super();
        this.response.success = true;
    }

    setForm(form: AuthResponse['form']): this {
        this.response.form = form;
        return this;
    }

    setRedirectUrl(redirectUrl: string): this {
        this.response.redirectUrl = redirectUrl;
        return this;
    }

    build(): AuthResponse {
        if (!this.response.form && !this.response.redirectUrl) {
            throw new Error('Response must have either form or redirectUrl');
        }
        return super.build();
    }
}

export type SuggestionResponse = BaseResponse & {
    suggestions: {
        imageUrl: string,
        primaryText: string,
        secondaryText: string,
        type: string,
        url: string
    }[];
}

export class SuggestionResponseBuilder extends BaseResponseBuilder<SuggestionResponse> {
    constructor() {
        super()
        this.response.success = true;
    }

    setSuggestions(suggestions: SuggestionResponse['suggestions']): this {
        this.response.suggestions = suggestions;
        return this;
    }

    public build(): SuggestionResponse {
        if (!this.response.suggestions) {
            throw new Error('Response must have suggestions');
        }
        return super.build();
    }

}
