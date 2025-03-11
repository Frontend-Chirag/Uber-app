export const AUTH_ERRORS = {
    INVALID_EMAIL_OTP: 'Invalid email OTP',
    INVALID_PHONE_OTP: 'Invalid phone OTP',
    USER_NOT_FOUND: 'User not found',
    SESSION_NOT_FOUND: 'Session data not found',
    UNKNOWN_ERROR: 'An unexpected error occurred',
} as const;

export const AUTH_SUCCESS = {
    LOGIN: 'Login successful',
    ACCOUNT_CREATED: 'Account created successfully',
} as const; 