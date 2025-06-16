// src/services/sms/templates.ts
export const OTP_SMS_TEMPLATE = (otp: string, expirationMinutes: number) => 
    `[Uber] Your verification code is ${otp}. Valid for ${expirationMinutes} minutes. Do not share this code with anyone.`;