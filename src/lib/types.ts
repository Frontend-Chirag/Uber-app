import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons";

export type link = {
    name: string;
    link: string;
    icon?: LucideIcon | IconType;
    isActive: boolean;
}

export enum FlowType {
    INITIAL = 'INITIAL', // for initally submit form
    SIGN_UP = 'SIGN_UP', // to verify email or phone number via otp
    PROGRESSIVE_SIGN_UP = 'PROGRESSIVE_SIGN_UP', // optionally field for number or email
    FINAL_SIGN_UP = 'FINAL_SIGN_UP',
    LOGIN = 'LOGIN'
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
