import { FieldType } from "@/types";
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


export function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
};

export function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

export function generateTimeSlots() {
  const now = new Date();

  // Round up to the next 15-minute slot
  const minutes = now.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  now.setMinutes(roundedMinutes);
  now.setSeconds(0);
  now.setMilliseconds(0);

  const slots: string[] = ['Now'];

  const slotCount = (9 * 60) / 15; // 9 hours = 36 slots

  for (let i = 0; i < slotCount; i++) {
    const slotTime = new Date(now.getTime() + i * 15 * 60 * 1000);
    const formatted = slotTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    slots.push(formatted);
  }

  return slots;
}


export async function getCurrentLocation(): Promise<{ lat: number, long: number }> {

  if (!navigator.geolocation) {
     
    throw new Error("Geolocation is not supported by your browser");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      resolve({ lat: latitude, long: longitude })
    }, (error) => {
      console.log('error in getting locaiton', error)
      reject(error);
    }, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  })
}
