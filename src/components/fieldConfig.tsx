import { FieldType } from "@/types";
import * as z from 'zod'
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { InputOTPSlot, InputOTPGroup, InputOTP } from "@/components/ui/input-otp";
import { Checkbox } from "@/components/ui/checkbox";
import { phoneCountryCodes } from "@/lib/constants";


export const FieldValidationSchema: Record<FieldType, z.ZodTypeAny> = {
    [FieldType.PHONE_COUNTRY_CODE]: z.string().min(1, "Select a country code"),
    [FieldType.PHONE_NUMBER]: z.string().regex(/^\d{10,15}$/, "Phone number must be between 10 to 15 digits").nonempty("Phone number is required"),
    [FieldType.PHONE_SMS_OTP]: z.string().regex(/^\d+$/, "Phone number must be numeric").nonempty("Phone number is required"),
    [FieldType.EMAIL_ADDRESS]: z.string().email("Invalid email address").nonempty("Email address is required"),
    [FieldType.EMAIL_OTP_CODE]: z.string().length(4, "OTP must be 4 digits").nonempty("OTP is required"),
    [FieldType.FIRST_NAME]: z.string().nonempty("First label is required"),
    [FieldType.LAST_NAME]: z.string().nonempty("Last label is required"),
    [FieldType.AGREE_TERMS_AND_CONDITIONS]: z.boolean().refine((value) => value === true, {
        message: "You must agree to the terms and conditions",
    }).default(false),

}

type FieldProps = {
    label: string;
    placeholder: string;
    type?: string;
    renderContent?: () => React.ReactElement;
};

// Define the type for each field configuration
type FieldConfig = {
    component: React.ComponentType<any>;
    props: FieldProps;
};


export const FIELD_CONFIG: Record<FieldType, FieldConfig> = {
    [FieldType.PHONE_COUNTRY_CODE]: {
        component: Select,
        props: {
            placeholder: "Select country code",
            label: "",
            renderContent: () => {
                return (
                    <>
                        <SelectTrigger className="h-full w-[100px] font-Rubik-SemiBold text-xl border-2 outline-none focus:ring-0 border-black">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="py-2">
                            {phoneCountryCodes.map((codes) => (
                                <SelectItem
                                    key={codes.initial}
                                    value={codes.initial}
                                    className="text-lg font-Rubik-SemiBold"
                                >
                                    {codes.country}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </>
                );
            }
        }
    },
    [FieldType.PHONE_NUMBER]: {
        component: Input,
        props: {
            type: "tel",
            placeholder: "Enter your phone number",
            label: "What's your phone number or email?"
        },
    },
    [FieldType.PHONE_SMS_OTP]: {
        component: InputOTP,
        props: {
            type: "text",
            placeholder: "Enter OTP",
            label: 'Enter the 4-digit code sent via SMS to:',
            renderContent: () => (
                <InputOTPGroup className="flex gap-x-2 mt-8">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <InputOTPSlot
                            key={index}
                            index={index}
                            aria-label={`OTP Slot ${index + 1}`}
                            className="w-16 h-16 focus-visible:ring-2 text-lg bg-neutral-200 shadow-none rounded-2xl" />
                    ))}
                </InputOTPGroup>
            )
        },
    },
    [FieldType.EMAIL_ADDRESS]: {
        component: Input,
        props: {
            type: "email",
            placeholder: "Enter your email address",
            label: "What's your phone number or email?"
        },
    },
    [FieldType.EMAIL_OTP_CODE]: {
        component: InputOTP,
        props: {
            type: "text",
            placeholder: "Enter OTP",
            label: 'Enter the 4-digit code sent to:',
            renderContent: () => (
                <InputOTPGroup className="flex gap-x-2 mt-8">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <InputOTPSlot
                            key={index}
                            index={index}
                            aria-label={`OTP Slot ${index + 1}`}
                            className="w-16 h-16 focus-visible:ring-2 text-lg bg-neutral-200 shadow-none rounded-2xl" />
                    ))}
                </InputOTPGroup>
            )
        },
    },
    [FieldType.FIRST_NAME]: {
        component: Input,
        props: {
            type: "text",
            placeholder: "Enter your first label",
            label: 'First name'
        },
    },
    [FieldType.LAST_NAME]: {
        component: Input,
        props: {
            type: "text",
            placeholder: "Enter your last label",
            label: 'Last Name'
        },
    },
    [FieldType.AGREE_TERMS_AND_CONDITIONS]: {
        component: Checkbox,
        props: {
            label: "I Agree",
            placeholder: "",
            type: undefined,
            renderContent: undefined
        }
    }
};