export enum FlowType {
    INITIAL = 'INITIAL', // for initally submit form
    SIGN_UP = 'SIGN_UP', // to verify email or phone number via otp
    PROGRESSIVE_SIGN_UP = 'PROGRESSIVE_SIGN_UP', // optionally field for number or email
    FINAL_SIGN_UP = 'FINAL_SIGN_UP',
    LOGIN = 'LOGIN',
}

export enum ScreenType {
    PHONE_NUMBER_INITIAL = 'PHONE_NUMBER_INITIAL',
    EMAIL_ADDRESS = 'EMAIL_ADDRESS',
    PHONE_OTP = 'PHONE_OTP',
    EMAIL_OTP_CODE = 'EMAIL_OTP_CODE',
    PHONE_NUMBER_PROGRESSIVE = 'PHONE_NUMBER_PROGRESSIVE',
    EMAIL_ADDRESS_PROGESSIVE = 'EMAIL_ADDRESS_PROGESSIVE',
    FIRST_NAME_LAST_NAME = 'FIRST_NAME_LAST_NAME',
    RESET_ACCOUNT = 'RESET_ACCOUNT',
    AGREE_TERMS_AND_CONDITIONS = 'AGREE_TERMS_AND_CONDITIONS'
}


export enum EventType {
    TypeInputEmail = 'TypeInputEmail',
    TypeInputExistingEmail= 'TypeInputExistingEmail',
    TypeInputExistingPhone= 'TypeInputExistingPhone',
    TypeInputMobile = 'TypeInputMobile',
    TypeSMSOTP = 'TypeSMSOTP',
    TypeResetAccount = 'TypeResetAccount',
    TypeEmailOTP = 'TypeEmailOTP',
    TypeInputDetails = 'TypeInputDetails',
    TypeCheckBox = 'TypeCheckBox'
}

export enum FieldType {
    PHONE_COUNTRY_CODE = 'phoneCountryCode',
    PHONE_NUMBER = 'phoneNumber',
    PHONE_SMS_OTP = 'phoneOTPCode',
    EMAIL_ADDRESS = 'emailAddress',
    EMAIL_OTP_CODE = 'emailOTPCode',
    FIRST_NAME = 'firstName',
    LAST_NAME = 'lastName',
    AGREE_TERMS_AND_CONDITIONS = 'termsAndconditions'
}

export interface sessionData {
    email?: string | null;
    phonenumber?: string | null;
    phoneCountryCode?: string | null;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    flowState: FlowType;
    firstname?: string | null;
    lastname?: string | null;
    otp?: {
        value: string | null;
        expiresAt: number | null;
    };
    type: 'Driver' | 'Rider' | null
}

export interface Session {
    sessionId: string;
    data: sessionData | null;
}


interface Fields {
    fieldType: string;
    hintValue?: string;
    profileHint?: {
       firstname: string,
       lastname: string,
       phonenumber: string,
       email:string
    };
    otpWidth?: number;
};

interface Screens {
    screenType: ScreenType;
    fields: Fields[];
    eventType: EventType; 
};

interface NextStep {
    flowType: FlowType;
    screens: Screens
};

export interface ResponseDataReturnProps {
    nextStep: NextStep;
    inAuthSessionID: string
};



export interface HandleResponseDataProps {
    flowType: FlowType;
    screenType: ScreenType;
    fields: Fields[];
    eventType: EventType;
    sessionId: string;
};

export interface User {
    id: string;
    firstname: string;
    lastname: string;
    email: string | null;
    phoneCountryCode: string | null;
    phonenumber: string | null;
    type: 'Driver' | 'Rider';
    createdAt: Date;
    updatedAt: Date;
} 

export interface Links {
    name: string;
    link: string;
    icon?: React.ElementType;
    isActive: boolean;
}