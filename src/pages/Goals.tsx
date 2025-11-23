import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus, Target, Trash2, PlusCircle } from 'lucide-react';
import { goalService } from '../services/goalService';
import type { Goal } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GoalModal } from '../components/GoalModal';
import { AddToGoalModal } from '../components/AddToGoalModal';

export const Goals: React.FC = () => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddToGoalModalOpen, setIsAddToGoalModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        try {
            setLoading(true);
            const data = await goalService.getAll();
            setGoals(data);
        } catch (error) {
            console.error('Error loading goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta meta?')) {
            try {
                await goalService.delete(id);
                loadGoals();
            } catch (error) {
                console.error('Error deleting goal:', error);
            }
        }
    };

    const handleAddToGoal = (goal: Goal) => {
        setSelectedGoal(goal);
        setIsAddToGoalModalOpen(true);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const calculateProgress = (current: number, target: number) => {
        return Math.min(Math.round((current / target) * 100), 100);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Metas Financeiras</h2>
                    <p className="text-text-muted mt-1">Defina objetivos e acompanhe seu progresso</p>
                </div>
                <Button
                    className="flex items-center gap-2"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus className="w-4 h-4" />
                    Nova Meta
                </Button>
            </div>

            {loading ? (
                <div className="text-center text-text-muted py-12">Carregando metas...</div>
            ) : goals.length === 0 ? (
                <Card className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-text-muted" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Nenhuma meta definida</h3>
                    <p className="text-text-muted mb-6">Comece criando sua primeira meta financeira!</p>
                    <Button onClick={() => setIsModalOpen(true)}>
                        Criar Primeira Meta
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map((goal) => {
                        const progress = calculateProgress(goal.current_amount, goal.target_amount);
                        const isCompleted = progress >= 100;

                        return (
                            <Card key={goal.id} className="relative group">
                                <button
                                    onClick={() => handleDelete(goal.id)}
                                    className="absolute top-4 right-4 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>

                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 ${isCompleted ? 'bg-success/10' : 'bg-primary/10'} rounded-xl flex items-center justify-center`}>
                                        <Target className={`w-6 h-6 ${isCompleted ? 'text-success' : 'text-primary'}`} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-text-muted">Alvo</p>
                                        <p className="font-bold text-white">{formatCurrency(goal.target_amount)}</p>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-1">{goal.name}</h3>
                                <p className="text-sm text-text-muted mb-6">
                                    Prazo: {format(new Date(goal.deadline), "d 'de' MMM, yyyy", { locale: ptBR })}
                                </p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">Progresso</span>
                                        <span className="font-medium text-white">{progress}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${isCompleted ? 'bg-success' : 'bg-primary'} transition-all duration-500`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-sm mt-1">
                                        <span className="text-text-muted">{formatCurrency(goal.current_amount)}</span>
                                        <span className="text-text-muted">
                                            {isCompleted ? 'Meta atingida! 🎉' : `Faltam ${formatCurrency(goal.target_amount - goal.current_amount)}`}
                                        </span>
                                    </div>
                                </div>

                                {!isCompleted && (
                                    <Button
                                        variant="secondary"
                                        className="w-full flex items-center justify-center gap-2"
                                        onClick={() => handleAddToGoal(goal)}
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        Adicionar Valor
                                    </Button>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}

            <GoalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadGoals}
            />

            <AddToGoalModal
                isOpen={isAddToGoalModalOpen}
                onClose={() => {
                    setIsAddToGoalModalOpen(false);
                    setSelectedGoal(null);
                }}
                onSuccess={loadGoals}
                goal={selectedGoal}
            />
        </div>
    );
};
