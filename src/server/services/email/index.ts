"use server";

import { OTP_EMAIL_TEMPLATE } from './templates';
import { generateOtp, validateEmail } from '../security/otp';
import nodemailer from 'nodemailer';



const emailTransporter =  nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


export interface EmailParams {
    email: string;
}

export const sendOTPEmail = async ({ email }: EmailParams) => {
    try {
        if (!email || !validateEmail(email)) {
            throw new Error('Invalid email address');
        }

        const otp = generateOtp();
        const template = OTP_EMAIL_TEMPLATE(otp.value, 5);

        await emailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            ...template
        });

        return otp;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send verification code via email');
    }
};