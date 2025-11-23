export interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
}

export interface Category {
    id: string;
    name: string;
    color: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
}

export interface Goal {
    id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    deadline: string;
}

export interface RecurringTransaction {
    id: string;
    user_id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    start_date: string;
    next_due_date: string;
    active: boolean;
}

export interface Budget {
    id: string;
    user_id: string;
    category: string;
    amount: number;
    month: string; // formato: YYYY-MM
    created_at?: string;
}
