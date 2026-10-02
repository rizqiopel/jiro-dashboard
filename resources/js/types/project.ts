export type Project = {
    id: number;
    name: string;
    description: string | null;
    status: 'active' | 'archived';
    created_at: string;
    updated_at: string;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export type ProjectFilters = {
    search: string;
    status: '' | Project['status'];
    sort: 'name' | 'status' | 'created_at';
    direction: 'asc' | 'desc';
    per_page: number;
};
