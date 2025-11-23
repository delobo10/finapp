import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Plus, Search, Trash2, Upload } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import type { Transaction } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransactionModal } from '../components/TransactionModal';
import { ImportTransactionsModal } from '../components/ImportTransactionsModal';

export const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const data = await transactionService.getAll();
            setTransactions(data);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            try {
                await transactionService.delete(id);
                loadTransactions();
            } catch (error) {
                console.error('Error deleting transaction:', error);
            }
        }
    };

    const filteredTransactions = transactions.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Transações</h2>
                    <p className="text-text-muted mt-1">Gerencie suas receitas e despesas</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        className="flex items-center gap-2"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus className="w-4 h-4" />
                        Nova Transação
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setIsImportModalOpen(true)}
                    >
                        <Upload className="w-4 h-4" />
                        Importar CSV
                    </Button>
                </div>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <Input
                            placeholder="Buscar transações..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface/50 border-b border-slate-800 rounded-t-lg">
                            <tr>
                                <th className="px-6 py-4 text-sm font-medium text-text-muted">Descrição</th>
                                <th className="px-6 py-4 text-sm font-medium text-text-muted">Categoria</th>
                                <th className="px-6 py-4 text-sm font-medium text-text-muted">Data</th>
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
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                                        Nenhuma transação encontrada.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-white">{transaction.description}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                                {transaction.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-text-muted text-sm">
                                            {format(new Date(transaction.date), "d 'de' MMM, yyyy", { locale: ptBR })}
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

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadTransactions}
            />

            <ImportTransactionsModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={loadTransactions}
            />
        </div>
    );
};
