export interface AdminResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: {
        code?: number;
        details?: string;
    };
}

export class AdminResponseBuilder {
    private response: AdminResponse;

    constructor() {
        this.response = {
            success: false,
            message: ""
        };
    }

    setSuccess(success: boolean) {
        this.response.success = success;
        return this;
    }

    setMessage(message: string) {
        this.response.message = message;
        return this;
    }

    setData<T>(data: T) {
        this.response.data = data;
        return this;
    }

    setError(code: number, details: string) {
        this.response.error = { code, details };
        return this;
    }

    build(): AdminResponse {
        return this.response;
    }
}
