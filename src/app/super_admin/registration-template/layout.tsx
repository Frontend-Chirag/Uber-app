
interface RegistrationTemplateLayoutProps { 
    children: React.ReactNode;
}

const RegistrationTemplateLayout = ({ children }: RegistrationTemplateLayoutProps) => {
    return (
        <div className='flex relative flex-col gap-4'>
            {children}
        </div>
    )
}   

export default RegistrationTemplateLayout;
