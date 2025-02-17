import { FieldType, HandleResponseDataProps, ResponseDataReturnProps } from "@/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
};

export const createResponseData = ({ flowType, sessionId, screenType, fields, eventType }: HandleResponseDataProps): ResponseDataReturnProps => {

  return {
      form: {
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

export const findEnumKey = (key: FieldType) => Object.entries(FieldType).find(([_, value]) => value === key)?.[0];
