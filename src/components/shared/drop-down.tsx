
import React from 'react'
import { DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenu } from '../ui/dropdown-menu'
import { ChevronDownIcon, LucideIcon } from 'lucide-react'

interface DropDownProps {
    trigger: React.ReactNode;
    items: {
        label: string;
        icon?: LucideIcon;
    }[];
}

export const DropDown = ({ trigger, items }: DropDownProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                {trigger}  <ChevronDownIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {items.map((item) => (
                    <DropdownMenuItem key={item.label}>
                        <div className='flex items-center gap-2'>
                            {item.icon && <item.icon />}
                            {item.label}
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
