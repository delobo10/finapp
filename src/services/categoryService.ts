import { supabase } from './supabase';

export interface Category {
    id: string;
    user_id: string;
    name: string;
    type: 'income' | 'expense';
    icon?: string;
    color?: string;
}

export const categoryService = {
    async getAll() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data as Category[];
    },

    async create(category: Omit<Category, 'id' | 'user_id'>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('categories')
            .insert([{ ...category, user_id: user.id }])
            .select()
            .single();

        if (error) throw error;
        return data as Category;
    },

    async update(id: string, category: Partial<Category>) {
        const { data, error } = await supabase
            .from('categories')
            .update(category)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Category;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Helper to initialize default categories if none exist
    async initializeDefaults() {
        const defaults = [
            { name: 'Alimentação', type: 'expense', icon: 'Utensils', color: '#ef4444' },
            { name: 'Moradia', type: 'expense', icon: 'Home', color: '#f97316' },
            { name: 'Transporte', type: 'expense', icon: 'Car', color: '#eab308' },
            { name: 'Lazer', type: 'expense', icon: 'Gamepad2', color: '#8b5cf6' },
            { name: 'Saúde', type: 'expense', icon: 'Heart', color: '#ec4899' },
            { name: 'Educação', type: 'expense', icon: 'GraduationCap', color: '#3b82f6' },
            { name: 'Salário', type: 'income', icon: 'Banknote', color: '#22c55e' },
            { name: 'Investimentos', type: 'income', icon: 'TrendingUp', color: '#10b981' },
            { name: 'Freelance', type: 'income', icon: 'Laptop', color: '#06b6d4' },
        ];

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { count } = await supabase
            .from('categories')
            .select('*', { count: 'exact', head: true });

        if (count === 0) {
            const { error } = await supabase
                .from('categories')
                .insert(defaults.map(c => ({ ...c, user_id: user.id })));

            if (error) console.error('Error initializing default categories:', error);
        }
    }
};
