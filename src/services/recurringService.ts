import { supabase } from './supabase';
import type { RecurringTransaction } from '../types';
import { notificationService } from './notificationService';

export const recurringService = {
    async getAll() {
        const { data, error } = await supabase
            .from('recurring_transactions')
            .select('*')
            .order('next_due_date', { ascending: true });
        if (error) throw error;
        return data as RecurringTransaction[];
    },

    async create(transaction: Omit<RecurringTransaction, 'id'>) {
        const { data, error } = await supabase
            .from('recurring_transactions')
            .insert(transaction)
            .select()
            .single();
        if (error) throw error;
        return data as RecurringTransaction;
    },

    async update(id: string, transaction: Partial<RecurringTransaction>) {
        const { data, error } = await supabase
            .from('recurring_transactions')
            .update(transaction)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as RecurringTransaction;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('recurring_transactions')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async processDueTransactions() {
        console.log('🔄 [RECURRING] Iniciando processamento de recorrências...');
        const today = new Date().toISOString().split('T')[0];
        console.log('📅 [RECURRING] Data de hoje:', today);

        const { data: dueRecurrings, error: fetchError } = await supabase
            .from('recurring_transactions')
            .select('*')
            .eq('active', true)
            .lte('next_due_date', today);

        console.log('📊 [RECURRING] Recorrências encontradas:', dueRecurrings);
        console.log('❌ [RECURRING] Erro ao buscar:', fetchError);

        if (fetchError) {
            console.error('🚨 [RECURRING] Erro ao buscar recorrências:', fetchError);
            throw fetchError;
        }

        if (!dueRecurrings || dueRecurrings.length === 0) {
            console.log('⚠️ [RECURRING] Nenhuma recorrência vencida encontrada.');
            return;
        }

        console.log(`✅ [RECURRING] ${dueRecurrings.length} recorrência(s) vencida(s) encontrada(s)`);

        const transactionInserts = dueRecurrings.map(rt => ({
            description: rt.description,
            amount: rt.amount,
            type: rt.type,
            category: rt.category,
            date: rt.next_due_date,
        }));

        console.log('💾 [RECURRING] Inserindo transações:', transactionInserts);

        const { error: insertError } = await supabase
            .from('transactions')
            .insert(transactionInserts);

        if (insertError) {
            console.error('🚨 [RECURRING] Erro ao inserir transações:', insertError);
            throw insertError;
        }

        console.log('✅ [RECURRING] Transações inseridas com sucesso!');

        // Create notifications for processed transactions
        for (const rt of dueRecurrings) {
            try {
                await notificationService.create({
                    title: 'Transação Recorrente Processada',
                    message: `A transação "${rt.description}" de ${rt.type === 'income' ? 'receita' : 'despesa'} foi processada automaticamente.`,
                    type: 'info',
                    related_entity_type: 'transaction',
                    related_entity_id: rt.id // Ideally this would be the ID of the NEW transaction, but we inserted in bulk. 
                    // For now, linking to the recurring config is fine, or just generic.
                });
            } catch (notifyError) {
                console.error('Error creating notification:', notifyError);
            }
        }

        console.log('🔄 [RECURRING] Atualizando próximas datas de vencimento...');

        for (const rt of dueRecurrings) {
            let nextDate = new Date(rt.next_due_date);
            switch (rt.frequency) {
                case 'daily':
                    nextDate.setDate(nextDate.getDate() + 1);
                    break;
                case 'weekly':
                    nextDate.setDate(nextDate.getDate() + 7);
                    break;
                case 'monthly':
                    nextDate.setMonth(nextDate.getMonth() + 1);
                    break;
                case 'yearly':
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                    break;
            }

            const newDueDate = nextDate.toISOString().split('T')[0];
            console.log(`📅 [RECURRING] Atualizando ${rt.description}: ${rt.next_due_date} → ${newDueDate}`);

            const { error: updError } = await supabase
                .from('recurring_transactions')
                .update({ next_due_date: newDueDate })
                .eq('id', rt.id);

            if (updError) {
                console.error('🚨 [RECURRING] Erro ao atualizar data:', updError);
                throw updError;
            }
        }

        console.log('✅ [RECURRING] Processamento concluído com sucesso!');
    },
};
