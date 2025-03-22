import { User } from "@/types/user";
import { ResponseDataReturnProps } from "@/types";

export class AuthResponseBuilder {
    private response: {
        status: number;
        error?: string;
        success?: string;
        user?: User;
        form?: ResponseDataReturnProps;
    };

    constructor() {
        this.response = { status: 200 };
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

    setSuccess(message: string) {
        this.response.success = message;
        return this;
    }

    setUser(user: User) {
        this.response.user = user;
        return this;
    }

    setForm(nextStep: ResponseDataReturnProps) {
        this.response.form = nextStep;
        return this;
    }

    build() {
        return this.response;
    }
} 