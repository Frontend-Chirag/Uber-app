import { HTTP_STATUS } from "@/lib/constants";
import { FlowType, ScreenType, EventType } from "@/types";
import { ContentfulStatusCode } from "hono/utils/http-status";

// ------------------------------------------------------------Base Response Builder----------------------------------------------------------

type BaseResponse<TData = any> = {
    status: ContentfulStatusCode;
    error?: string;
    success: boolean;
    message?: string;
    data: TData;
}

export class BaseResponseBuilder<TData = any, T extends BaseResponse<TData> = BaseResponse<TData>> {
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

    public setData(data: TData): this {
        this.response.data = data;
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


type AuthForm = {
    flowType: FlowType;
    screens: {
        screenType: ScreenType;
        fields: AuthFields[];
        eventType: EventType;
    };
    inAuthSessionId: string;
};

export type AuthResponseData = {
    form?: AuthForm;
    redirectUrl?: string;
};

export type AuthResponse = BaseResponse<AuthResponseData>;


export class AuthResponseBuilder extends BaseResponseBuilder<AuthResponseData, AuthResponse> {
    constructor() {
        super();
        this.response.success = true;
    }

    setData(data: AuthResponseData): this {
        this.response.data = data;
        return this;
      }

    build(): AuthResponse {
        return super.build();
    }
}

export type SuggestionData = {
    suggestions: {
        imageUrl: string,
        primaryText: string,
        secondaryText: string,
        type: string,
        url: string
    }[];
}

export type SuggestionResponse = BaseResponse<SuggestionData>

export class SuggestionResponseBuilder extends BaseResponseBuilder<SuggestionData, BaseResponse> {
    constructor() {
        super()
        this.response.success = true;
    }

    public setData(data: SuggestionData): this {
        this.response.data = data;
        return this;
    }
   
    public build(): SuggestionResponse {
        if (!this.response.data) {
            throw new Error('Response must have suggestions');
        }
        return super.build();
    }

}
