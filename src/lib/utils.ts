import { FieldType, HandleResponseDataProps, ResponseDataReturnProps,FlowType, ScreenType,EventType } from "@/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import jwt from 'jsonwebtoken';
import { sessionData } from "@/types";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
};

export const createResponseData = ({ flowType, sessionId, screenType, fields, eventType }: HandleResponseDataProps): ResponseDataReturnProps => {

  return {
    nextStep: {
      flowType,
      screens: {
        screenType,
        fields,
        eventType
      }
    },
    inAuthSessionID: sessionId
  };
};

export const findEnumKey = (value: string): keyof typeof FieldType | undefined => {
  return Object.keys(FieldType).find(
    (key) => FieldType[key as keyof typeof FieldType] === value
  ) as keyof typeof FieldType | undefined;
};


export const getNextStep = (session: sessionData, sessionId: string) => {
  if (session.emailVerified && session.phoneVerified) {
      return getDetailsStep(sessionId);
  }

  if (!session.emailVerified) {
      return getEmailVerificationStep(sessionId, session);
  }

  return getPhoneVerificationStep(sessionId, session);
};

export const getDetailsStep = (sessionId: string) => {
  return createResponseData({
      flowType: FlowType.PROGRESSIVE_SIGN_UP,
      screenType: ScreenType.FIRST_NAME_LAST_NAME,
      fields: [
          { fieldType: findEnumKey(FieldType.FIRST_NAME)! },
          { fieldType: findEnumKey(FieldType.LAST_NAME)! },
      ],
      eventType: EventType.TypeInputDetails,
      sessionId
  });
};

export const getEmailVerificationStep = (sessionId: string, session: sessionData) => {
  return createResponseData({
      flowType: FlowType.PROGRESSIVE_SIGN_UP,
      screenType: ScreenType.EMAIL_ADDRESS_PROGESSIVE,
      fields: [
          {
              fieldType: findEnumKey(FieldType.EMAIL_ADDRESS)!,
              hintValue: session.email!,
              otpWidth: session.otp?.value?.length
          }
      ],
      eventType: EventType.TypeInputEmail,
      sessionId
  });
};

export const getPhoneVerificationStep = (sessionId: string, session: sessionData) => {
  return createResponseData({
      flowType: FlowType.PROGRESSIVE_SIGN_UP,
      screenType: ScreenType.PHONE_NUMBER_PROGRESSIVE,
      fields: [
          { fieldType: findEnumKey(FieldType.PHONE_COUNTRY_CODE)!, hintValue: session.phoneCountryCode! },
          { fieldType: findEnumKey(FieldType.PHONE_NUMBER)!, hintValue: session.phonenumber!, otpWidth: session.otp?.value?.length },
      ],
      eventType: EventType.TypeInputMobile,
      sessionId
  });
}; 


interface Data {
  id: string;
  contact: string;
  name: string
}

export const generateRefreshToken = ({ id, contact, name }: Data) => {
  return {
    refreshToken: jwt.sign({ id, contact, name }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' } as jwt.SignOptions)
  };
};

export const generateAccessToken = ({ id, contact, name }: Data) => {

  return {
    accessToken: jwt.sign({ id, contact, name }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1hr' } as jwt.SignOptions)
  };
};


 
