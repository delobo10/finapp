import { supabase } from './supabase';
import type { Goal } from '../types';

export const goalService = {
    async getAll() {
        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .order('deadline', { ascending: true });

        if (error) throw error;
        return data as Goal[];
    },

    async create(goal: Omit<Goal, 'id' | 'current_amount'>) {
        const { data, error } = await supabase
            .from('goals')
            .insert({ ...goal, current_amount: 0 })
            .select()
            .single();

        if (error) throw error;
        return data as Goal;
    },

    async update(id: string, goal: Partial<Goal>) {
        const { data, error } = await supabase
            .from('goals')
            .update(goal)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Goal;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('goals')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
