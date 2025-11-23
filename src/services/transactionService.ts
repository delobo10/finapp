import { supabase } from './supabase';
import type { Transaction } from '../types';

export const transactionService = {
    async getAll() {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;
        return data as Transaction[];
    },

    async create(transaction: Omit<Transaction, 'id'>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('transactions')
            .insert({ ...transaction, user_id: user.id })
            .select()
            .single();

        if (error) throw error;

        // Verificar se excedeu o orçamento
        if (transaction.type === 'expense') {
            try {
                const month = transaction.date.substring(0, 7);
                console.log('Verificando orçamento para:', { category: transaction.category, month });

                const { data: budgets, error: budgetError } = await supabase
                    .from('budgets')
                    .select('*')
                    .eq('month', month)
                    .eq('category', transaction.category);

                if (budgetError) {
                    console.error('Erro ao buscar orçamento:', budgetError);
                    throw budgetError;
                }

                console.log('Orçamentos encontrados:', budgets);

                if (budgets && budgets.length > 0) {
                    const budget = budgets[0];

                    // Calcular total gasto nesta categoria no mês
                    const [year, monthNum] = month.split('-');
                    const firstDay = `${year}-${monthNum}-01`;
                    const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).toISOString().split('T')[0];

                    const { data: transactions, error: transError } = await supabase
                        .from('transactions')
                        .select('amount')
                        .eq('category', transaction.category)
                        .eq('type', 'expense')
                        .gte('date', firstDay)
                        .lte('date', lastDay);

                    if (transError) {
                        console.error('Erro ao buscar transações:', transError);
                        throw transError;
                    }

                    const totalSpent = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
                    const percentage = (totalSpent / budget.amount) * 100;

                    console.log('Verificação de orçamento:', {
                        totalSpent,
                        budgetAmount: budget.amount,
                        percentage: percentage.toFixed(2) + '%'
                    });

                    if (totalSpent > budget.amount) {
                        console.log('Orçamento excedido! Criando notificação...');
                        const { notificationService } = await import('./notificationService');
                        await notificationService.create({
                            title: 'Orçamento Excedido',
                            message: `Você excedeu seu orçamento de ${transaction.category} para este mês.`,
                            type: 'warning',
                            related_entity_type: 'budget',
                            related_entity_id: budget.id
                        });
                        console.log('Notificação de orçamento excedido criada');
                        window.dispatchEvent(new CustomEvent('notification-created'));
                    } else if (totalSpent >= budget.amount * 0.8) {
                        console.log('80% do orçamento atingido! Criando notificação...');
                        const { notificationService } = await import('./notificationService');
                        await notificationService.create({
                            title: 'Alerta de Orçamento',
                            message: `Você atingiu ${percentage.toFixed(0)}% do seu orçamento de ${transaction.category}.`,
                            type: 'warning',
                            related_entity_type: 'budget',
                            related_entity_id: budget.id
                        });
                        console.log('Notificação de alerta criada');
                        window.dispatchEvent(new CustomEvent('notification-created'));
                    }
                } else {
                    console.log('Nenhum orçamento encontrado para esta categoria e mês');
                }
            } catch (checkError) {
                console.error('Erro ao verificar orçamento:', checkError);
            }
        }

        return data as Transaction;
    },

    async bulkCreate(transactions: Omit<Transaction, 'id' | 'user_id'>[]) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const transactionsWithUser = transactions.map(t => ({
            ...t,
            user_id: user.id
        }));

        const { data, error } = await supabase
            .from('transactions')
            .insert(transactionsWithUser)
            .select();

        if (error) throw error;
        return data as Transaction[];
    },

    async update(id: string, transaction: Partial<Transaction>) {
        const { data, error } = await supabase
            .from('transactions')
            .update(transaction)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Transaction;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getSummary() {
        const { data, error } = await supabase
            .from('transactions')
            .select('amount, type');

        if (error) throw error;

        const summary = data.reduce(
            (acc, curr) => {
                const amount = Number(curr.amount);
                if (curr.type === 'income') {
                    acc.income += amount;
                    acc.total += amount;
                } else {
                    acc.expense += amount;
                    acc.total -= amount;
                }
                return acc;
            },
            { income: 0, expense: 0, total: 0 }
        );

        return summary;
    }
};
