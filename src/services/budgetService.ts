import { supabase } from './supabase';
import type { Budget } from '../types';

class BudgetService {
    async getAll(month?: string): Promise<Budget[]> {
        let query = supabase
            .from('budgets')
            .select('*')
            .order('category', { ascending: true });

        if (month) {
            query = query.eq('month', month);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    }

    async getByMonth(month: string): Promise<Budget[]> {
        const { data, error } = await supabase
            .from('budgets')
            .select('*')
            .eq('month', month)
            .order('category', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async create(budget: Omit<Budget, 'id' | 'created_at'>): Promise<Budget> {
        const { data, error } = await supabase
            .from('budgets')
            .insert([budget])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, updates: Partial<Budget>): Promise<Budget> {
        const { data, error } = await supabase
            .from('budgets')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('budgets')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // Calcular quanto foi gasto em uma categoria no mês
    async getSpentInCategory(category: string, month: string, _userId: string): Promise<number> {
        // Pegar primeiro e último dia do mês
        const [year, monthNum] = month.split('-');
        const firstDay = `${year}-${monthNum}-01`;
        const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('transactions')
            .select('amount')
            .eq('category', category)
            .eq('type', 'expense')
            .gte('date', firstDay)
            .lte('date', lastDay);

        if (error) throw error;

        return data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    }

    async getIncomeForecast(month: string): Promise<number> {
        const { data, error } = await supabase
            .from('income_forecasts')
            .select('amount')
            .eq('month', month)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
        return data?.amount || 0;
    }

    async upsertIncomeForecast(month: string, amount: number, userId: string): Promise<void> {
        const { error } = await supabase
            .from('income_forecasts')
            .upsert({
                user_id: userId,
                month,
                amount
            }, { onConflict: 'user_id,month' });

        if (error) throw error;
    }
}

export const budgetService = new BudgetService();
