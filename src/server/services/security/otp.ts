

// Types
export interface OTP {
    value: string;
    expiresAt: number;
}

// Constants
const OTP_LENGTH = 4;
const DEFAULT_EXPIRATION_MINUTES = 5;
const OTP_MIN = Math.pow(10, OTP_LENGTH - 1);
const OTP_MAX = Math.pow(10, OTP_LENGTH) - 1;

export const generateOtp = (expirationTimeInMinutes: number = DEFAULT_EXPIRATION_MINUTES): OTP => {
    const otp = Math.floor(OTP_MIN + Math.random() * (OTP_MAX - OTP_MIN + 1))
        .toString()
        .padStart(OTP_LENGTH, '0');
    const expiresAt = Date.now() + expirationTimeInMinutes * 60 * 1000;
    return { value: otp, expiresAt };
};

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
};