import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
    Plus,
    Wallet,
    TrendingDown,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Trash2,
    Save,
    Edit,
} from 'lucide-react';
import { budgetService } from '../services/budgetService';
import { transactionService } from '../services/transactionService';
import { notificationService } from '../services/notificationService';
import type { Budget, Transaction } from '../types';
import { BudgetModal } from '../components/BudgetModal';
import { useAuth } from '../contexts/AuthContext';

export const Budgets: React.FC = () => {
    const { user } = useAuth();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
    const [currentMonth, setCurrentMonth] = useState(
        new Date().toISOString().slice(0, 7) // YYYY-MM
    );
    const [incomeForecast, setIncomeForecast] = useState<number>(0);
    const [isEditingForecast, setIsEditingForecast] = useState(false);
    const [tempForecast, setTempForecast] = useState<string>('');

    // Carrega dados ao mudar o mês
    useEffect(() => {
        loadData();
    }, [currentMonth]);

    // Escuta eventos de atualização de transações (ex.: criação via TransactionModal)
    useEffect(() => {
        const handler = () => loadData();
        window.addEventListener('transaction-updated', handler);
        return () => window.removeEventListener('transaction-updated', handler);
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [budgetsData, transactionsData, forecastData] = await Promise.all([
                budgetService.getByMonth(currentMonth),
                transactionService.getAll(),
                budgetService.getIncomeForecast(currentMonth),
            ]);
            setBudgets(budgetsData);
            setTransactions(transactionsData);
            setIncomeForecast(forecastData);
            setTempForecast(forecastData.toString());
        } catch (error) {
            console.error('Error loading budgets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveForecast = async () => {
        if (!user) return;
        try {
            const amount = parseFloat(tempForecast);
            if (isNaN(amount)) return;
            await budgetService.upsertIncomeForecast(currentMonth, amount, user.id);
            // Recarrega tudo para refletir a nova previsão e receitas
            await loadData();
            // Cria notificação de atualização de previsão
            await notificationService.create({
                title: 'Previsão Atualizada',
                message: `Previsão de receita para ${currentMonth} atualizada para ${formatCurrency(amount)}`,
                type: 'info',
                related_entity_type: 'forecast',
                related_entity_id: currentMonth,
            });
        } catch (error) {
            console.error('Error saving forecast:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este orçamento?')) {
            try {
                await budgetService.delete(id);
                await loadData();
            } catch (error) {
                console.error('Error deleting budget:', error);
            }
        }
    };

    const handleEdit = (budget: Budget) => {
        setBudgetToEdit(budget);
        setIsModalOpen(true);
    };

    const getSpentInCategory = (category: string): number => {
        const [year, month] = currentMonth.split('-');
        const firstDay = `${year}-${month}-01`;
        const lastDay = new Date(parseInt(year), parseInt(month), 0)
            .toISOString()
            .split('T')[0];
        return transactions
            .filter(
                (t) =>
                    t.category === category &&
                    t.type === 'expense' &&
                    t.date >= firstDay &&
                    t.date <= lastDay
            )
            .reduce((sum, t) => sum + Number(t.amount), 0);
    };

    // Receita realizada no mês corrente
    const getIncomeInMonth = (): number => {
        const [year, month] = currentMonth.split('-');
        const firstDay = `${year}-${month}-01`;
        const lastDay = new Date(parseInt(year), parseInt(month), 0)
            .toISOString()
            .split('T')[0];
        return transactions
            .filter(
                (t) => t.type === 'income' && t.date >= firstDay && t.date <= lastDay
            )
            .reduce((sum, t) => sum + Number(t.amount), 0);
    };

    const getBudgetStatus = (spent: number, budget: number) => {
        const percentage = (spent / budget) * 100;
        if (percentage >= 100)
            return { status: 'critical', color: 'text-danger', bg: 'bg-danger', icon: AlertTriangle };
        if (percentage >= 80)
            return { status: 'warning', color: 'text-warning', bg: 'bg-warning', icon: TrendingDown };
        return { status: 'good', color: 'text-success', bg: 'bg-success', icon: CheckCircle };
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + getSpentInCategory(b.category), 0);
    const totalIncome = getIncomeInMonth();
    const remainingToBudget = incomeForecast + totalIncome - totalBudget;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Orçamentos</h2>
                    <p className="text-text-muted mt-1">Planeje e controle seus gastos</p>
                </div>
                <div className="flex gap-3">
                    <input
                        type="month"
                        value={currentMonth}
                        onChange={(e) => setCurrentMonth(e.target.value)}
                        className="px-4 py-2 bg-surface border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                    />
                    <Button onClick={() => { setBudgetToEdit(null); setIsModalOpen(true); }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Orçamento
                    </Button>
                </div>
            </div>

            {/* Card de resumo */}
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Previsão de Receita */}
                    <div className="relative group">
                        <p className="text-text-muted text-sm mb-1">Previsão de Receita</p>
                        {isEditingForecast ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={tempForecast}
                                    onChange={(e) => setTempForecast(e.target.value)}
                                    className="w-full bg-background border border-slate-700 rounded px-2 py-1 text-white"
                                    autoFocus
                                />
                                <button onClick={handleSaveForecast} className="text-success hover:text-success/80">
                                    <Save className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div
                                className="flex items-center gap-2 cursor-pointer hover:bg-slate-800/50 p-1 rounded -ml-1"
                                onClick={() => setIsEditingForecast(true)}
                            >
                                <p className="text-2xl font-bold text-success">{formatCurrency(incomeForecast)}</p>
                                <span className="text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                                    (Editar)
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Total Orçado */}
                    <div>
                        <p className="text-text-muted text-sm mb-1">Total Orçado</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totalBudget)}</p>
                        <p className="text-xs text-text-muted mt-1">
                            {((totalBudget / (incomeForecast || 1)) * 100).toFixed(1)}% da receita prevista
                        </p>
                    </div>

                    {/* Receita Realizada */}
                    <div>
                        <p className="text-text-muted text-sm mb-1">Receita Realizada</p>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-success" />
                            <p className="text-2xl font-bold text-white">{formatCurrency(totalIncome)}</p>
                        </div>
                        <p className="text-xs text-text-muted mt-1">
                            {((totalIncome / (incomeForecast || 1)) * 100).toFixed(1)}% da previsão
                        </p>
                    </div>

                    {/* Saldo para Orçar */}
                    <div>
                        <p className="text-text-muted text-sm mb-1">Saldo para Orçar</p>
                        <p className={`text-2xl font-bold ${remainingToBudget < 0 ? 'text-danger' : 'text-primary'}`}>
                            {formatCurrency(remainingToBudget)}
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                            {remainingToBudget < 0 ? 'Você orçou mais do que previu ganhar!' : 'Disponível para distribuir'}
                        </p>
                    </div>
                </div>

                {/* Barra de progresso (Gasto vs Orçado) */}
                <div className="mt-6 pt-6 border-t border-slate-800">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-text-muted">Execução do Orçamento (Gasto vs Orçado)</span>
                        <span className="text-white">
                            {formatCurrency(totalSpent)} de {formatCurrency(totalBudget)}
                        </span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all ${totalSpent >= totalBudget
                                ? 'bg-danger'
                                : totalSpent >= totalBudget * 0.8
                                    ? 'bg-warning'
                                    : 'bg-success'
                                }`}
                            style={{ width: `${totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0}%` }}
                        />
                    </div>
                </div>
            </Card>

            {/* Cards de orçamento individual */}
            {budgets.length === 0 ? (
                <Card className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wallet className="w-8 h-8 text-text-muted" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Nenhum orçamento definido</h3>
                    <p className="text-text-muted mb-6">Comece criando seu primeiro orçamento mensal!</p>
                    <Button onClick={() => { setBudgetToEdit(null); setIsModalOpen(true); }}>Criar Primeiro Orçamento</Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.map((budget) => {
                        const spent = getSpentInCategory(budget.category);
                        const percentage = (spent / budget.amount) * 100;
                        const status = getBudgetStatus(spent, budget.amount);
                        const StatusIcon = status.icon;
                        return (
                            <Card key={budget.id} className="relative group">
                                {/* Botão excluir */}
                                <button
                                    onClick={() => handleDelete(budget.id)}
                                    className="absolute top-4 right-4 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                {/* Botão editar */}
                                <button
                                    onClick={() => handleEdit(budget)}
                                    className="absolute top-4 right-10 text-text-muted hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 ${status.bg}/10 rounded-xl flex items-center justify-center`}>
                                        <StatusIcon className={`w-6 h-6 ${status.color}`} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-text-muted">Limite</p>
                                        <p className="font-bold text-white">{formatCurrency(budget.amount)}</p>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">{budget.category}</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">Gasto</span>
                                        <span className={`font-semibold ${status.color}`}>{formatCurrency(spent)}</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${status.bg} transition-all duration-500`}
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">{percentage.toFixed(1)}% usado</span>
                                        <span className="text-text-muted">
                                            Restam {formatCurrency(Math.max(budget.amount - spent, 0))}
                                        </span>
                                    </div>
                                </div>
                                {percentage >= 80 && (
                                    <div className={`mt-4 p-3 ${status.bg}/10 rounded-lg border border-${status.bg}/20`}>
                                        <p className={`text-sm ${status.color} font-medium`}>
                                            {percentage >= 100 ? '⚠️ Orçamento ultrapassado!' : '⚠️ Atenção ao limite!'}
                                        </p>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Modal de criação/edição de orçamento */}
            <BudgetModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setBudgetToEdit(null);
                }}
                onSuccess={loadData}
                month={currentMonth}
                budgetToEdit={budgetToEdit}
            />
        </div>
    );
};
