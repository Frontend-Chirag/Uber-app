import { User } from "@/types/user";
import { ResponseDataReturnProps } from "@/types";

export class AuthResponseBuilder {
    private response: {
        status: number;
        error?: string;
        success: boolean;
        user?: User;
        form?: ResponseDataReturnProps;
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