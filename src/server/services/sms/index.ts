"use server";

import { generateOtp, OTP, validatePhone } from "../security/otp";
import { OTP_SMS_TEMPLATE } from "./templates";
import twilio from 'twilio';


export interface SMSParams {
    phonenumber: string;
    phoneCountryCode: string;
}

export const sendSMSMobile = async ({ phonenumber, phoneCountryCode }: SMSParams): Promise<OTP> => {

    const twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID, 
        process.env.TWILIO_AUTH_TOKEN
    );

    console.log(phonenumber, phoneCountryCode)

    try {
        // Input validation
        if (!phonenumber || !validatePhone(phonenumber)) {
            throw new Error('Invalid phone number');
        }

        if (!phoneCountryCode || !/^\+\d{1,4}$/.test(phoneCountryCode)) {
            throw new Error('Invalid country code');
        }

        // TODO: Implement rate limiting here
        const otp = generateOtp()
        const template = OTP_SMS_TEMPLATE(otp.value, 5);;


        await twilioClient.messages.create({
            body: template,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `${phoneCountryCode}${phonenumber}`
        });

        return otp;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw new Error('Failed to send verification code via SMS');
    }
};