"use server";

import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Types
interface OTP {
    value: string;
    expiresAt: number;
}

interface EmailParams {
    email: string;
}

interface SMSParams {
    phonenumber: string;
    phoneCountryCode: string;
}

// Constants
const OTP_LENGTH = 4;
const DEFAULT_EXPIRATION_MINUTES = 5;
const OTP_MIN = Math.pow(10, OTP_LENGTH - 1);
const OTP_MAX = Math.pow(10, OTP_LENGTH) - 1;

// Create reusable transporter object using SMTP transport
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


const generateOtp = (expirationTimeInMinutes: number = DEFAULT_EXPIRATION_MINUTES): OTP => {
    // Generate a 4-digit OTP using crypto-safe random in production
    const otp = Math.floor(OTP_MIN + Math.random() * (OTP_MAX - OTP_MIN + 1)).toString().padStart(OTP_LENGTH, '0');
    const expiresAt = Date.now() + expirationTimeInMinutes * 60 * 1000;

    return { value: otp, expiresAt };
};

const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
};

export const sendOTPEmail = async ({ email }: EmailParams): Promise<OTP> => {
    try {
        // Input validation
        if (!email || !validateEmail(email)) {
            throw new Error('Invalid email address');
        }

        // TODO: Implement rate limiting here
        const otp = generateOtp();
        

        await emailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Verification Code',
            text: `Your verification code is ${otp.value}. This code will expire in ${DEFAULT_EXPIRATION_MINUTES} minutes.`,
            html: `
                <h2>Your Verification Code</h2>
                <p>Your verification code is: <strong>${otp.value}</strong></p>
                <p>This code will expire in ${DEFAULT_EXPIRATION_MINUTES} minutes.</p>
            `
        });

        return otp;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send verification code via email');
    }
};

export const sendSMSMobile = async ({ phonenumber, phoneCountryCode }: SMSParams): Promise<OTP> => {
    try {
        // Input validation
        if (!phonenumber || !validatePhone(phonenumber)) {
            throw new Error('Invalid phone number');
        }

        if (!phoneCountryCode || !/^\+\d{1,4}$/.test(phoneCountryCode)) {
            throw new Error('Invalid country code');
        }

        // TODO: Implement rate limiting here
        const otp = generateOtp();
    

        await twilioClient.messages.create({
            body: `Your verification code is ${otp.value}. This code will expire in ${DEFAULT_EXPIRATION_MINUTES} minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `${phoneCountryCode}${phonenumber}`
        });

        return otp;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw new Error('Failed to send verification code via SMS');
    }
};

// // Utility function to verify OTP
// export const verifyOTP = (identifier: string, otpValue: string): boolean => {
//     const storedOTP = otpStore.get(identifier);
    
//     if (!storedOTP) {
//         return false;
//     }

//     const isValid = storedOTP.value === otpValue && Date.now() <= storedOTP.expiresAt;
    
//     if (isValid) {
//         otpStore.delete(identifier); // Delete OTP after successful verification
//     }

//     return isValid;
// };
