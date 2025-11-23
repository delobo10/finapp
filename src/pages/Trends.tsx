import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { transactionService } from '../services/transactionService';
import { type Transaction } from '../types';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { format, subMonths, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, DollarSign, Activity } from 'lucide-react';

export const Trends: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [prediction, setPrediction] = useState<number>(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await transactionService.getAll();
            processData(data);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const processData = (data: Transaction[]) => {
        // 1. Monthly Trend (Last 6 months)
        const end = new Date();
        const start = subMonths(end, 5);
        const months = eachMonthOfInterval({ start, end });

        const monthlyStats = months.map(month => {
            const monthKey = format(month, 'yyyy-MM');
            const monthLabel = format(month, 'MMM', { locale: ptBR });

            const monthTransactions = data.filter(t => t.date.startsWith(monthKey));

            const income = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + Number(t.amount), 0);

            const expense = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Number(t.amount), 0);

            return {
                name: monthLabel,
                Receitas: income,
                Despesas: expense,
                Saldo: income - expense
            };
        });
        setMonthlyData(monthlyStats);

        // 2. Category Distribution (Current Month)
        const currentMonthKey = format(end, 'yyyy-MM');
        const currentMonthExpenses = data.filter(t =>
            t.date.startsWith(currentMonthKey) && t.type === 'expense'
        );

        const categoryStats = Object.entries(
            currentMonthExpenses.reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
                return acc;
            }, {} as Record<string, number>)
        ).map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        setCategoryData(categoryStats);

        // 3. Simple Prediction (Average of last 3 months expenses)
        const last3Months = monthlyStats.slice(-4, -1); // Exclude current month if incomplete? Let's use last 3 full months if possible, or just last 3 available.
        // Actually, let's use the last 3 months from the stats we generated.
        const avgExpense = last3Months.reduce((sum, m) => sum + m.Despesas, 0) / (last3Months.length || 1);
        setPrediction(avgExpense);
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Análise de Tendências</h2>
                <p className="text-text-muted mt-1">Visualize o histórico e projeções das suas finanças</p>
            </div>

            {/* Prediction Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-surface to-surface/50 border-primary/20">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-text-muted text-sm">Média de Gastos (3 meses)</p>
                            <h3 className="text-2xl font-bold text-white mt-1">{formatCurrency(prediction)}</h3>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Activity className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-text-muted">
                        Baseado no seu histórico recente
                    </div>
                </Card>

                {/* Add more summary cards if needed */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Trend Chart */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Fluxo de Caixa Mensal
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" tickFormatter={(value) => `R$${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Legend />
                                <Bar dataKey="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Category Distribution */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        Gastos por Categoria (Mês Atual)
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                >
                                    {categoryData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Balance Trend */}
                <Card className="p-6 lg:col-span-2">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Evolução do Saldo
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="Saldo" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};
