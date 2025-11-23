import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus, Calendar, Trash2, RefreshCw } from 'lucide-react';
import { recurringService } from '../services/recurringService';
import type { RecurringTransaction } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RecurringModal } from '../components/RecurringModal';

export const Recurring: React.FC = () => {
    const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const data = await recurringService.getAll();
            setTransactions(data);
        } catch (error) {
            console.error('Error loading recurring transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta recorrência?')) {
            try {
                await recurringService.delete(id);
                await loadTransactions();
            } catch (error) {
                console.error('Error deleting recurring transaction:', error);
            }
        }
    };

    const handleProcessDue = async () => {
        try {
            setLoading(true);
            await recurringService.processDueTransactions();
            await loadTransactions();
        } catch (error) {
            console.error('Error processing due recurring transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const translateFrequency = (freq: string) => {
        const map: Record<string, string> = {
            daily: 'Diária',
            weekly: 'Semanal',
            monthly: 'Mensal',
            yearly: 'Anual',
        };
        return map[freq] || freq;
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Transações Recorrentes</h2>
                    <p className="text-text-muted mt-1">Gerencie suas contas fixas e assinaturas</p>
                </div>
                <div className="flex gap-2">
                    <Button className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-4 h-4" />
                        Nova Recorrência
                    </Button>
                    <Button className="flex items-center gap-2" onClick={handleProcessDue} disabled={loading}>
                        <RefreshCw className="w-4 h-4" />
                        Processar Recorrências
                    </Button>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface/50 border-b border-slate-800 rounded-t-lg">
                            <tr>
                                <th className="px-6 py-4 text-sm font-medium text-text-muted">Descrição</th>
                                <th className="px-6 py-4 text-sm font-medium text-text-muted">Frequência</th>
                                <th className="px-6 py-4 text-sm font-medium text-text-muted">Próximo Vencimento</th>
                                <th className="px-6 py-4 text-sm font-medium text-text-muted text-right">Valor</th>
                                <th className="px-6 py-4 text-sm font-medium text-text-muted text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                                        Carregando...
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                                        Nenhuma recorrência cadastrada.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-primary">
                                                    <RefreshCw className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{transaction.description}</p>
                                                    <p className="text-sm text-text-muted">{transaction.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-text-muted border border-slate-700">
                                                {translateFrequency(transaction.frequency)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-text-muted">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-sm">
                                                    {format(new Date(transaction.next_due_date), "d 'de' MMM, yyyy", { locale: ptBR })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-bold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                                                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(Number(transaction.amount))}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleDelete(transaction.id)}
                                                className="text-text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <RecurringModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadTransactions}
            />
        </div>
    );
};
