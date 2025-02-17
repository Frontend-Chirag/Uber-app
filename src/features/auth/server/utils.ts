"use server";

import nodemailer from 'nodemailer';
import twilio from 'twilio';


const generateOtp = (expirationTimeInMinutes: number = 5) => {
    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Set expiration time in milliseconds
    const expiresAt = Date.now() + expirationTimeInMinutes * 60 * 1000;

    // Store OTP in otpStore

    return { value: otp, expiresAt };
};

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


export const sendOTPEmail = async ({ email }: { email: string }) => {

    const otp = generateOtp();

    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transport.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your verification code',
        text: `Your verification code is ${otp.value}`
    });

    return otp;
};

export const sendSMSMobile = async ({ phonenumber, phoneCountryCode }: { phonenumber: string, phoneCountryCode: string }) => {
    const otp = generateOtp();

    await twilioClient.messages.create({
        body: `Your verification code is ${otp.value}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `${phoneCountryCode}${phonenumber}`
    });

    return otp;

};
