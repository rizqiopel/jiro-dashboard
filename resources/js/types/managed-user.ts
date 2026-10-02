export type ManagedUser = {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    email_verified_at: string | null;
    roles?: { id: number; name: string }[];
};
