import { FIELD_CONFIG } from '@/features/auth/fieldConfig';
import { cn } from '@/lib/utils';
import { useAuthFlow, } from '@/features/auth/auth-flow-provider';
import { EventType, FieldType, FlowType, ScreenType } from '@/types';
import { useFormContext } from 'react-hook-form';
import { useCallback, memo, useMemo } from 'react';

// helper function to determine if we should show email/phone
const shouldShowEmailPhoneToggle = (flow: FlowType, screen: ScreenType) => {
    return flow === FlowType.INITIAL ||
        (flow === FlowType.PROGRESSIVE_SIGN_UP &&
            (screen === ScreenType.EMAIL_ADDRESS_PROGESSIVE ||
                screen === ScreenType.PHONE_NUMBER_PROGRESSIVE)
        )
};


export const AuthFormFields = memo(() => {
    const form = useFormContext();
    const { flowType, fieldType, screenType, setFieldType, setEventType } = useAuthFlow();

    const isInitial = flowType === FlowType.INITIAL;
    const showEmailPhoneToggle = shouldShowEmailPhoneToggle(flowType, screenType);

    const handleChangeEventEmailToPhone = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const isEmail = value.length < 3 || /^[a-zA-Z]{3}$/.test(value.slice(0, 3));

        let newFieldType: FieldType[]

        if (isEmail) {
            newFieldType = [FieldType.EMAIL_ADDRESS]
            setEventType(EventType.TypeInputEmail);
        } else {
            form.setValue('phoneNumber', value);
            newFieldType = [FieldType.PHONE_COUNTRY_CODE, FieldType.PHONE_NUMBER]
            setEventType(EventType.TypeInputMobile);
        }
        setFieldType([...newFieldType]);
    }, [form, setFieldType, setEventType]);


    // Partition fields in a single pass
    const { phoneFields, otherFields } = useMemo(() => {
        return fieldType.reduce(
            (acc, field) => {
                if (field === FieldType.PHONE_COUNTRY_CODE || field === FieldType.PHONE_NUMBER) {
                    acc.phoneFields.push(field);
                } else {
                    acc.otherFields.push(field);
                }
                return acc;
            },
            { phoneFields: [] as FieldType[], otherFields: [] as FieldType[] }
        )
    }, [fieldType]);

    // helper to render a field
    const renderField = (field: FieldType) => {
        const config = FIELD_CONFIG[field];
        return config.renderField({
            field,
            form,
            component: config.component,
            props: config.props,
            isInitial,
            handleChangeEventEmailToPhone:
                showEmailPhoneToggle && (field === FieldType.EMAIL_ADDRESS || field === FieldType.PHONE_NUMBER)
                    ? handleChangeEventEmailToPhone
                    : undefined,
        })
    }

    return (
        <div className="flex flex-col w-full gap-4">
            {phoneFields.length > 0 && (
                <div className="flex gap-x-2">
                    {phoneFields.map(renderField)}
                </div>
            )}
            {otherFields.map(renderField)}
        </div>
    );
});

AuthFormFields.displayName = 'AuthFormFields';
