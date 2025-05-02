import { FieldType} from "@/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
};

export const findEnumKey = (value: string): keyof typeof FieldType | undefined => {
  return Object.keys(FieldType).find(
    (key) => FieldType[key as keyof typeof FieldType] === value
  ) as keyof typeof FieldType | undefined;
};

// Email validation regex
export const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

// Phone number validation regex (supports international format)
export const phoneRegex = /^\+[1-9]\d{1,14}$/;