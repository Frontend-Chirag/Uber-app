import { RegistrationTemplateForm } from "@/features/admin/registration-template-form";

export default function CreateRegistrationTemplate() {

    return (
        <div className="px-12 py-4 flex flex-col gap-4 w-full h-full overflow-y-auto">
            <h1 className="text-2xl font-Rubik-Semibold">Create Registration Template</h1>
            <div className="border-t  border-t-input">
                <div className="flex flex-col mt-8">
                    <RegistrationTemplateForm />
                </div>
            </div>
        </div>
    )
}