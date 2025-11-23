import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { X, PiggyBank } from 'lucide-react';
import { goalService } from '../services/goalService';

interface AddToGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    goal: {
        id: string;
        name: string;
        current_amount: number;
        target_amount: number;
    } | null;
}

export const AddToGoalModal: React.FC<AddToGoalModalProps> = ({ isOpen, onClose, onSuccess, goal }) => {
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState('');

    if (!isOpen || !goal) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const newAmount = goal.current_amount + Number(amount);
            await goalService.update(goal.id, {
                current_amount: newAmount
            });

            if (newAmount >= goal.target_amount && goal.current_amount < goal.target_amount) {
                const { notificationService } = await import('../services/notificationService');
                await notificationService.create({
                    title: 'Meta Atingida! 🎉',
                    message: `Parabéns! Você atingiu sua meta "${goal.name}".`,
                    type: 'success',
                    related_entity_type: 'goal',
                    related_entity_id: goal.id
                });
            }

            setAmount('');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error adding to goal:', error);
        } finally {
            setLoading(false);
        }
    };

    const remaining = goal.target_amount - goal.current_amount;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-muted hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <PiggyBank className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Adicionar à Meta</h2>
                        <p className="text-sm text-text-muted">{goal.name}</p>
                    </div>
                </div>

                <div className="bg-surface rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-text-muted text-sm">Valor Atual</span>
                        <span className="text-white font-semibold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.current_amount)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-text-muted text-sm">Meta</span>
                        <span className="text-white font-semibold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.target_amount)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                        <span className="text-text-muted text-sm">Falta</span>
                        <span className="text-primary font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(remaining)}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Valor a Adicionar"
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0,00"
                        required
                        autoFocus
                    />

                    {amount && Number(amount) > 0 && (
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                            <p className="text-sm text-text-muted mb-1">Novo valor total:</p>
                            <p className="text-lg font-bold text-primary">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                    goal.current_amount + Number(amount)
                                )}
                            </p>
                            <p className="text-xs text-text-muted mt-1">
                                {((goal.current_amount + Number(amount)) / goal.target_amount * 100).toFixed(1)}% da meta
                            </p>
                        </div>
                    )}

                    <Button type="submit" className="w-full mt-6" disabled={loading || !amount || Number(amount) <= 0}>
                        {loading ? 'Adicionando...' : 'Adicionar à Meta'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};
