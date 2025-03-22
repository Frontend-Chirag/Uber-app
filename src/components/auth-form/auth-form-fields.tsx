import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FIELD_CONFIG } from '@/components/fieldConfig';
import { cn } from '@/lib/utils';
import { useAuthFlow, } from '@/components/auth-form/auth-flow-provider';
import { EventType, FieldType, FlowType, ScreenType } from '@/types';
import { phoneCountryCodes } from '@/lib/constants';
import { useFormContext } from 'react-hook-form';
import { ChangeEvent, useCallback, memo } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const CountryCodeDropdown = memo(({ field }: { field: any }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant={'outline'} className="w-[100px] flex h-[50px] truncate justify-between hover:bg-transparent ring-2 ring-black font-Rubik-SemiBold text-lg">
                {phoneCountryCodes.find((code) => code.code === field.value)?.initial || phoneCountryCodes[0].initial}
                <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='h-[300px] overflow-hidden overflow-y-auto border-none rounded-xl shadow-lg'>
            {phoneCountryCodes.map((code) => (
                <DropdownMenuItem
                    key={code.initial}
                    onClick={() => {
                        const selectedCountry = phoneCountryCodes.find(
                            (c) => c.country === code.country
                        );
                        field.onChange(selectedCountry?.code);
                    }}
                    className='flex cursor-pointer justify-between items-center'
                >
                    <span className='font-Rubik-SemiBold text-lg text-nowrap'>{code.country}</span>
                    <span className='font-Rubik-Regular text-md ml-2'>{code.code}</span>
                </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
    </DropdownMenu>
));

export const AuthFormFields = memo(() => {
    const form = useFormContext();
    const { flowType, fieldType, screenType, setFieldType, setEventType } = useAuthFlow();

    const isInitial = flowType === FlowType.INITIAL;
    const isFirstNameLastName = screenType === ScreenType.FIRST_NAME_LAST_NAME;

    const handleChangeEventEmailToPhone = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const isEmail = value.length < 3 || /^[a-zA-Z]{3}$/.test(value.slice(0, 3));

        console.log(isEmail);

        if (isEmail) {
            setFieldType([FieldType.EMAIL_ADDRESS]);
            console.log('Email')
            setEventType(EventType.TypeInputEmail);
        } else {
            console.log('phoneNumber')
            form.setValue('phoneNumber', value);
            setFieldType([FieldType.PHONE_COUNTRY_CODE, FieldType.PHONE_NUMBER]);
            setEventType(EventType.TypeInputMobile);
        }
    }, [form, setFieldType, setEventType]);

    return (
        <div className={cn('flex w-full justify-start items-start gap-x-2 ',
            isFirstNameLastName ? 'flex-col  gap-y-8 mt-4' : 'flex-row justify-start h-full items-start')}>
            {fieldType.map(field => {
                const config = FIELD_CONFIG[field];
                return config.renderField({
                    field,
                    form,
                    component: config.component,
                    props: config.props,
                    isInitial,
                    isFirstNameLastName,
                    handleChangeEventEmailToPhone
                });
            })}
        </div>
    );
});

AuthFormFields.displayName = 'AuthFormFields';
