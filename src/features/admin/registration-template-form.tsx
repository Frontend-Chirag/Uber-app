"use client"

import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormControl, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal'
import { Plus, X } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegistrationStepType } from '@prisma/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { phoneCountryCodes } from '@/lib/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

enum documentType {
    driversLicense = 'driversLicense',
    profilePhoto = 'profilePhoto',
    document = 'document',
    vehicleRegistration = 'vehicleRegistration',
    vehicleInsurance = 'vehicleInsurance',
}

enum documentFieldType {
    text = 'text',
    number = 'number',
    date = 'date',
    url = 'url',
}

const fieldSchema = z.object({
    label: z.string(),
    type: z.nativeEnum(documentFieldType),
    isRequired: z.boolean(),
})

const documentSchema = z.object({
    name: z.string(),
    subTitle: z.string(),
    description: z.string(),
    type: z.nativeEnum(documentType),
    fields: z.array(fieldSchema),
})


const formSchema = z.object({
    countryCode: z.string().min(1),
    documents: z.array(documentSchema),
})

type DocumentField = {
    label: string;
    type: documentFieldType;
    isRequired: boolean;
    placeholder?: string;
    validationRules?: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
        patternError?: string;
    };
}

type DocumentConfig = {
    name: string;
    subTitle: string;
    description: string;
    type: documentType;
    fields: DocumentField[];
}

type TemplateFormData = {
    countryCode: string;
    documents: DocumentConfig[];
}

// Define document templates by country 

const countryDocumentTemplates: Record<string, Array<Omit<DocumentConfig, 'type'>>> = {
    'In': [
        {
            name: "Aadhaar Card",
            subTitle: "Please provide your Aadhaar Card details",
            description: "Upload a clear photo of your Aadhaar Card",
            fields: []
        },
        {
            name: "PAN Card",
            subTitle: "Please provide your PAN Card details",
            description: "Upload a clear photo of your PAN Card",
            fields: []
        },
        {
            name: "Vehicle Permit",
            subTitle: "Please provide your vehicle permit details",
            description: "Upload a clear photo of your vehicle permit",
            fields: []
        }
    ],
    'US': [
        {
            name: "National Insurance Card",
            subTitle: "Please provide your National Insurance Card details",
            description: "Upload a clear photo of your National Insurance Card",
            fields: []
        },
        {
            name: "MOT Certificate",
            subTitle: "Please provide your MOT Certificate details",
            description: "Upload a clear photo of your MOT Certificate",
            fields: []
        }
    ]
}


const defaultDocumentConfigs: Record<documentType, Partial<DocumentConfig>> = {
    [documentType.driversLicense]: {
        name: "Driver's License - Front",
        subTitle: "Please provide your driver's license details",
        description: "Upload clear photos of both sides of your driver's license",
        fields: [
            {
                label: "License Number",
                type: documentFieldType.text,
                isRequired: true,
                placeholder: "Enter your license number"
            },
            {
                label: "Expiry Date",
                type: documentFieldType.date,
                isRequired: true
            }
        ]
    },
    [documentType.profilePhoto]: {
        name: "Profile Photo",
        subTitle: "Please provide your profile photo",
        description: "Upload a clear photo of yourself",
        fields: []
    },
    [documentType.document]: {
        name: "",
        subTitle: "",
        description: "",
        fields: []
    },
    [documentType.vehicleRegistration]: {
        name: "Vehicle Registration",
        subTitle: "Please provide your vehicle registration details",
        description: "Upload a clear photo of your vehicle registration",
        fields: []
    },
    [documentType.vehicleInsurance]: {
        name: "Vehicle Insurance",
        subTitle: "Please provide your vehicle insurance details",
        description: "Upload a clear photo of your vehicle insurance",
        fields: []
    }
}

// custom hook for managing document fields

const useDocumentFields = (defaultFields: DocumentField[]) => {
    const [fields, setFields] = useState<DocumentField[]>(defaultFields);

    const addField = (field: DocumentField) => {
        setFields([...fields, field]);
    };

    const removeField = (index: number) => {
        setFields(fields.filter((_, idx) => idx !== index));
    }

    const updateField = (index: number, field: Partial<DocumentField>) => {
        setFields(fields.map((f, idx) => idx === index ? { ...f, ...field } : f));
    }

    return { fields, addField, removeField, updateField };
}

export const RegistrationTemplateForm = () => {

    const [selectedCountry, setSelectedCountry] = useState<string>(phoneCountryCodes[0].initial);
    const [isAddingField, setIsAddingField] = useState(false);

    const form = useForm<TemplateFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            countryCode: phoneCountryCodes[0].initial,
            documents: [],
        }
    });

    const { fields: documentFields, addField, removeField, updateField } = useDocumentFields(
        defaultDocumentConfigs[documentType.driversLicense]?.fields || []
    )

    const docForm = useForm<z.infer<typeof documentSchema>>({
        resolver: zodResolver(documentSchema),
        defaultValues: {
            name: '',
            subTitle: '',
            description: '',
            type: documentType.driversLicense,
            fields: [],
        }
    });

    const handleCountryChange = (country: string) => {
        setSelectedCountry(country);
        form.setValue('countryCode', country);
    };


    const handleDocumentSelect = (template: Omit<DocumentConfig, 'type'>) => {
        docForm.reset({
            ...template,
            type: documentType.document
        })
    }


    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'documents'
    });

    return (
        <div className='flex flex-col gap-6'>
            <div>
                <Select
                    onValueChange={handleCountryChange}
                    defaultValue={selectedCountry}
                >

                    <SelectTrigger className="h-10 w-full font-Rubik-SemiBold text-xl border-2 outline-none focus:ring-0 border-black">
                        <SelectValue />
                    </SelectTrigger>

                    <SelectContent className="py-2">
                        {phoneCountryCodes.map((codes, idx) => (
                            <SelectItem
                                key={idx}
                                value={codes.initial}
                                className="text-lg font-Rubik-SemiBold"
                            >
                                {codes.country}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className='md:col-span-2'>
                {fields.map((field, idx) => (
                    <div key={field.id} className='flex items-center justify-between'>
                        <p>{field.name}</p>
                        <Button type='button' onClick={() => remove(idx)}>
                            <X />
                            Remove Document
                        </Button>
                    </div>
                ))}
            </div>
            <Form {...docForm}>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-2xl shadow-md max-w-full h-full overflow-y-auto">

                    <div className="md:col-span-2">
                        <FormLabel className='text-md font-Rubik-SemiBold mb-2 block'>Available Documents for {selectedCountry}</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {countryDocumentTemplates[selectedCountry]?.map((template, idx) => (
                                <Button
                                    key={idx}
                                    type="button"
                                    variant="outline"
                                    className="p-4 h-auto flex flex-col items-start text-left"
                                    onClick={() => handleDocumentSelect(template)}
                                >
                                    <span className="font-semibold">{template.name}</span>
                                    <span className="text-sm text-gray-500">{template.subTitle}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                    {docForm.watch('name') && (
                        <>
                            <FormField
                                control={docForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-md font-Rubik-SemiBold'>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder='Enter Document Name'
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={docForm.control}
                                name="subTitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-md font-Rubik-SemiBold'>Sub Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder='Enter Document Sub Title'
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={docForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-md font-Rubik-SemiBold'>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder='Enter Document Description'
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                        </>
                    )}

                    <Button
                        type='button'
                        onClick={() => append(docForm.getValues())}
                        className='md:col-span-2'
                    >
                        <Plus />
                        Add Document
                    </Button>
                </form>
            </Form>
        </div>
    )
}

type ValidationSidebarProps = {
    field: DocumentField | null;
    onUpdate: (field: DocumentField) => void;
}

const ValidationSidebar = ({field, onUpdate}: ValidationSidebarProps) => { 
    if(!field) return null;
    
}
