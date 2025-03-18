import { FieldType } from "@/types";
import * as z from 'zod'
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { InputOTPSlot, InputOTPGroup, InputOTP } from "@/components/ui/input-otp";
import { Checkbox } from "@/components/ui/checkbox";
import { phoneCountryCodes } from "@/lib/constants";
import { memo, JSX } from "react";
import { ChangeEvent } from "react";
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";

export const FieldValidationSchema = {
    [FieldType.PHONE_COUNTRY_CODE]: z.string().min(1, "Select a country code"),
    [FieldType.PHONE_NUMBER]: z.string().regex(/^\d{10,15}$/, "Phone number must be between 10 to 15 digits"),
    [FieldType.PHONE_SMS_OTP]: z.string().regex(/^\d+$/, "Phone number must be numeric"),
    [FieldType.EMAIL_ADDRESS]: z.string().email("Invalid email address"),
    [FieldType.EMAIL_OTP_CODE]: z.string().length(4, "OTP must be 4 digits"),
    [FieldType.FIRST_NAME]: z.string().nonempty("First name is required"),
    [FieldType.LAST_NAME]: z.string().nonempty("Last name is required"),
    [FieldType.AGREE_TERMS_AND_CONDITIONS]: z.boolean()
        .refine((value) => value === true, {
            message: "You must agree to the terms and conditions",
        }),
};

export interface RenderFieldProps {
    field: FieldType;
    form: any; // Replace with your form type
    component: React.ElementType;
    props: BaseFieldProps;
    isInitial?: boolean;
    isFirstNameLastName?: boolean;
    handleChangeEventEmailToPhone?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface BaseFieldProps {
    label: string;
    placeholder: string;
    type?: string;
    renderContent?: () => React.ReactNode;
}

export interface FieldConfigProps {
    component: React.ElementType;
    props: BaseFieldProps;
    renderField: (props: RenderFieldProps) => JSX.Element;
}

const MemoizedOTPGroup = memo(() => (
    <InputOTPGroup className="flex gap-x-2 mt-8">
        {Array.from({ length: 4 }).map((_, index) => (
            <InputOTPSlot
                key={index}
                index={index}
                aria-label={`OTP Slot ${index + 1}`}
                className="w-16 h-16 focus-visible:ring-2 text-lg bg-neutral-200 shadow-none rounded-2xl"
            />
        ))}
    </InputOTPGroup>
));
MemoizedOTPGroup.displayName = 'MemoizedOTPGroup';

const MemoizedCountryCodeContent = memo(({ field }: { field: any }) => (
    <>
        <SelectTrigger className="h-full w-[100px] font-Rubik-SemiBold text-xl border-2 outline-none focus:ring-0 border-black">
            <SelectValue />
        </SelectTrigger>
        <SelectContent className="py-2">
            {phoneCountryCodes.map((codes) => (
                <SelectItem
                    onSelect={() => {
                        const selectedCountry = phoneCountryCodes.find(
                            (c) => c.country === codes.country
                        );
                        field.onChange(selectedCountry?.code);
                    }}
                    key={codes.initial}
                    value={field.value}
                    className="text-lg font-Rubik-SemiBold"
                >
                    {codes.country}
                </SelectItem>
            ))}
        </SelectContent>
    </>
));
MemoizedCountryCodeContent.displayName = 'MemoizedCountryCodeContent';

export const FIELD_CONFIG: Record<FieldType, FieldConfigProps> = {
    [FieldType.PHONE_COUNTRY_CODE]: {
        component: Select,
        props: {
            placeholder: "Select country code",
            label: "",
        },
        renderField: ({ field, form, component: Component, props }) => (
            <FormField
                key={field}
                name={field}
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Component 
                             {...field}
                             {...props}
                            >
                                <MemoizedCountryCodeContent field={field} />
                            </Component>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )
    },
    [FieldType.PHONE_NUMBER]: {
        component: Input,
        props: {
            type: "tel",
            placeholder: "Enter your phone number",
            label: "What's your phone number or email?"
        },
        renderField: ({ field, form, component: Component, props }) => (
            <FormField
                key={field}
                name={field}
                control={form.control}
                render={({ field }) => (
                    <FormItem className='flex flex-1 flex-col'>
                        <FormLabel className='text-2xl font-Rubik-normal'>{props.label}</FormLabel>
                        <FormControl>
                            <Component
                                {...field}
                                {...props}
                                autoFocus
                                className='w-full h-14 px-4 md:text-lg rounded-lg bg-neutral-200 border-none focus-visible:ring-2 placeholder:text-xl'
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )
    },
    [FieldType.PHONE_SMS_OTP]: {
        component: InputOTP,
        props: {
            type: "text",
            placeholder: "Enter OTP",
            label: 'Enter the 4-digit code sent via SMS to:',
            renderContent: () => <MemoizedOTPGroup />
        },
        renderField: ({ field, form, component: Component, props }) => (
            <FormField
                key={field}
                name={field}
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Component {...field} maxLength={4}>
                                {props.renderContent?.()}
                            </Component>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )
    },
    [FieldType.EMAIL_ADDRESS]: {
        component: Input,
        props: {
            type: "email",
            placeholder: "Enter your email address",
            label: "What's your phone number or email?"
        },
        renderField: ({ field, form, component: Component, props, isFirstNameLastName, isInitial, handleChangeEventEmailToPhone }) => (
            <FormField
                key={field}
                name={field}
                control={form.control}
                render={({ field }) => (
                    <FormItem className='flex flex-1 flex-col'>
                        {isFirstNameLastName && (
                            <FormLabel className='text-2xl font-Rubik-normal'>{props.label}</FormLabel>
                        )}
                        <FormControl>
                            <Component
                                {...field}
                                {...props}
                                autoFocus
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    field.onChange(e);
                                    if (isInitial) {
                                        handleChangeEventEmailToPhone?.(e);
                                    }
                                }}
                                className='w-full h-14 px-4 md:text-lg rounded-lg bg-neutral-200 border-none focus-visible:ring-2 placeholder:text-xl'
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )
    },
    [FieldType.EMAIL_OTP_CODE]: {
        component: InputOTP,
        props: {
            type: "text",
            placeholder: "Enter OTP",
            label: 'Enter the 4-digit code sent to:',
            renderContent: () => <MemoizedOTPGroup />
        },
        renderField: ({ field, form, component: Component, props }) => (
            <FormField
                key={field}
                name={field}
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Component {...field} maxLength={4}>
                                {props.renderContent?.()}
                            </Component>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )
    },
    [FieldType.FIRST_NAME]: {
        component: Input,
        props: {
            type: "text",
            placeholder: "Enter your first name",
            label: 'First name'
        },
        renderField: ({ field, form, component: Component, props }) => (
            <FormField
                key={field}
                name={field}
                control={form.control}
                render={({ field }) => (
                    <FormItem className='flex flex-1 flex-col'>
                        <FormLabel className='text-2xl font-Rubik-normal'>{props.label}</FormLabel>
                        <FormControl>
                            <Component
                                {...field}
                                {...props}
                                autoFocus
                                className='w-full h-14 px-4 md:text-lg rounded-lg bg-neutral-200 border-none focus-visible:ring-2 placeholder:text-xl'
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )
    },
    [FieldType.LAST_NAME]: {
        component: Input,
        props: {
            type: "text",
            placeholder: "Enter your last name",
            label: 'Last Name'
        },
        renderField: ({ field, form, component: Component, props }) => (
            <FormField
                key={field}
                name={field}
                control={form.control}
                render={({ field }) => (
                    <FormItem className='flex flex-1 flex-col'>
                        <FormLabel className='text-2xl font-Rubik-normal'>{props.label}</FormLabel>
                        <FormControl>
                            <Component
                                {...field}
                                {...props}
                                autoFocus
                                className='w-full h-14 px-4 md:text-lg rounded-lg bg-neutral-200 border-none focus-visible:ring-2 placeholder:text-xl'
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )
    },
    [FieldType.AGREE_TERMS_AND_CONDITIONS]: {
        component: Checkbox,
        props: {
            label: "I Agree",
            placeholder: ""
        },
        renderField: ({ field, form, component: Component, props }) => (
            <FormField
                key={field}
                name={field}
                control={form.control}
                render={({ field }) => (
                    <FormItem className='w-full flex h-[50px] flex-col justify-start items-end mt-12 mb-6'>
                        <div className='w-full flex justify-between items-center'>
                            <FormLabel>{props.label}</FormLabel>
                            <FormControl>
                                <Component
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className='w-6 h-6 rounded-none border-2'
                                />
                            </FormControl>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )
    }
} as const;

export type FieldConfigType = typeof FIELD_CONFIG;