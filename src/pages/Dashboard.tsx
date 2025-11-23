import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { ArrowUpRight, ArrowDownRight, DollarSign, Calendar, PieChart as PieChartIcon, TrendingUp, Plus, Target, FileText } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import type { Transaction } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { QuoteCard } from '../components/QuoteCard';
import { useNavigate } from 'react-router-dom';
import { TransactionModal } from '../components/TransactionModal';
import { Skeleton } from '../components/Skeleton';
import { Button } from '../components/Button';

export const Dashboard: React.FC = () => {
    const [summary, setSummary] = useState({ income: 0, expense: 0, total: 0 });
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [summaryData, transactionsData] = await Promise.all([
                transactionService.getSummary(),
                transactionService.getAll()
            ]);
            setSummary(summaryData);
            setAllTransactions(transactionsData);
            setRecentTransactions(transactionsData.slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const getCategoryData = () => {
        const categoryTotals: Record<string, number> = {};
        allTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
            });

        return Object.entries(categoryTotals)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const getMonthlyData = () => {
        const monthlyTotals: Record<string, { income: number; expense: number }> = {};

        allTransactions.forEach(t => {
            const month = format(new Date(t.date), 'MMM/yy', { locale: ptBR });
            if (!monthlyTotals[month]) {
                monthlyTotals[month] = { income: 0, expense: 0 };
            }
            if (t.type === 'income') {
                monthlyTotals[month].income += Number(t.amount);
            } else {
                monthlyTotals[month].expense += Number(t.amount);
            }
        });

        return Object.entries(monthlyTotals)
            .map(([month, data]) => ({
                month,
                Receitas: data.income,
                Despesas: data.expense
            }))
            .slice(-6);
    };

    const categoryData = getCategoryData();
    const monthlyData = getMonthlyData();

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Dashboard</h2>
                    <p className="text-text-muted mt-1">Visão geral das suas finanças</p>
                </div>

                {/* Quick Access Actions */}
                <div className="flex gap-3">
                    <Button onClick={() => setIsTransactionModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Transação
                    </Button>
                </div>
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => setIsTransactionModalOpen(true)} className="p-4 bg-surface hover:bg-surface/80 border border-slate-800 rounded-xl transition-all text-left group">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <p className="font-medium text-white">Nova Transação</p>
                </button>
                <button onClick={() => navigate('/goals')} className="p-4 bg-surface hover:bg-surface/80 border border-slate-800 rounded-xl transition-all text-left group">
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Target className="w-5 h-5 text-success" />
                    </div>
                    <p className="font-medium text-white">Metas</p>
                </button>
                <button onClick={() => navigate('/reports')} className="p-4 bg-surface hover:bg-surface/80 border border-slate-800 rounded-xl transition-all text-left group">
                    <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5 text-warning" />
                    </div>
                    <p className="font-medium text-white">Relatórios</p>
                </button>
                <button onClick={() => navigate('/trends')} className="p-4 bg-surface hover:bg-surface/80 border border-slate-800 rounded-xl transition-all text-left group">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                    </div>
                    <p className="font-medium text-white">Tendências</p>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                    <>
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                    </>
                ) : (
                    <>
                        <Card className="relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <DollarSign className="w-24 h-24 text-white" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-text-muted font-medium">Saldo Total</p>
                                <h3 className="text-3xl font-bold text-white mt-2">{formatCurrency(summary.total)}</h3>
                            </div>
                        </Card>

                        <Card className="relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <ArrowUpRight className="w-24 h-24 text-success" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-text-muted font-medium">Receitas</p>
                                <h3 className="text-3xl font-bold text-white mt-2">{formatCurrency(summary.income)}</h3>
                            </div>
                        </Card>

                        <Card className="relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <ArrowDownRight className="w-24 h-24 text-danger" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-text-muted font-medium">Despesas</p>
                                <h3 className="text-3xl font-bold text-white mt-2">{formatCurrency(summary.expense)}</h3>
                            </div>
                        </Card>
                    </>
                )}
            </div>

            {/* Quote Card */}
            <QuoteCard />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    <>
                        <Skeleton className="h-[300px]" />
                        <Skeleton className="h-[300px]" />
                    </>
                ) : (
                    <>
                        <Card>
                            <div className="flex items-center gap-2 mb-6">
                                <PieChartIcon className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-semibold text-white">Despesas por Categoria</h3>
                            </div>
                            {categoryData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {categoryData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-text-muted">
                                    Nenhuma despesa registrada
                                </div>
                            )}
                        </Card>

                        <Card>
                            <div className="flex items-center gap-2 mb-6">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-semibold text-white">Receitas vs Despesas</h3>
                            </div>
                            {monthlyData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="month" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" tickFormatter={(value) => `R$ ${value}`} />
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                            labelStyle={{ color: '#e2e8f0' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="Receitas" fill="#10b981" radius={[8, 8, 0, 0]} />
                                        <Bar dataKey="Despesas" fill="#ef4444" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-text-muted">
                                    Nenhuma transação registrada
                                </div>
                            )}
                        </Card>
                    </>
                )}
            </div>

            {/* Recent Transactions */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Transações Recentes</h3>
                </div>
                <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-surface border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-medium text-text-muted">Descrição</th>
                                    <th className="px-6 py-4 text-sm font-medium text-text-muted">Categoria</th>
                                    <th className="px-6 py-4 text-sm font-medium text-text-muted">Data</th>
                                    <th className="px-6 py-4 text-sm font-medium text-text-muted text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="p-4">
                                            <Skeleton className="h-12 w-full" />
                                        </td>
                                    </tr>
                                ) : recentTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl">
                                                    {transaction.type === 'income' ? '💰' : '💸'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{transaction.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-text-muted border border-slate-700">
                                                {transaction.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-text-muted">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-sm">
                                                    {format(new Date(transaction.date), "d 'de' MMM, yyyy", { locale: ptBR })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-bold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                                                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(Number(transaction.amount))}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && recentTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-text-muted">
                                            Nenhuma transação recente encontrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <TransactionModal
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                onSuccess={loadDashboardData}
            />
        </div>
    );
};
