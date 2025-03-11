import { $Enums } from "@prisma/client";

export interface User {
    id: string;
    type: $Enums.Role;
    firstname: string;
    lastname: string | null;
    email: string | null;
    phoneCountryCode: string | null;
    phonenumber: string | null;
    role: $Enums.Role;
    updatedAt: Date;
} 