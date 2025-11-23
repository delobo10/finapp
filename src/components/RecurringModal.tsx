import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { X } from 'lucide-react';
import { recurringService } from '../services/recurringService';
import { useAuth } from '../contexts/AuthContext';
import { categoryService, type Category } from '../services/categoryService';

interface RecurringModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const RecurringModal: React.FC<RecurringModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'expense' as 'income' | 'expense',
        category: '',
        frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
        start_date: new Date().toISOString().split('T')[0],
        next_due_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (isOpen) {
            loadCategories();
        }
    }, [isOpen]);

    const loadCategories = async () => {
        try {
            await categoryService.initializeDefaults();
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            console.error('User not authenticated');
            return;
        }
        try {
            setLoading(true);
            await recurringService.create({
                user_id: user.id,
                description: formData.description,
                amount: Number(formData.amount),
                type: formData.type,
                category: formData.category,
                frequency: formData.frequency,
                start_date: formData.start_date,
                next_due_date: formData.next_due_date,
                active: true
            });
            onSuccess();
            onClose();
            setFormData({
                description: '',
                amount: '',
                type: 'expense',
                category: '',
                frequency: 'monthly',
                start_date: new Date().toISOString().split('T')[0],
                next_due_date: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            console.error('Error creating recurring transaction:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(c => c.type === formData.type);

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <Card className="w-full max-w-md relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-text-muted hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <h2 className="text-2xl font-bold text-white mb-6">Nova Recorrência</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-4 mb-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${formData.type === 'income'
                                    ? 'bg-success text-white'
                                    : 'bg-surface text-text-muted hover:bg-slate-700'
                                    }`}
                            >
                                Receita
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${formData.type === 'expense'
                                    ? 'bg-danger text-white'
                                    : 'bg-surface text-text-muted hover:bg-slate-700'
                                    }`}
                            >
                                Despesa
                            </button>
                        </div>

                        <Input
                            label="Descrição"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />

                        <Input
                            label="Valor"
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Categoria</label>
                            <div className="flex gap-2">
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="flex-1 px-4 py-2 bg-background border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {filteredCategories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Frequência</label>
                            <select
                                value={formData.frequency}
                                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                                className="w-full px-4 py-2 bg-background border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                            >
                                <option value="daily">Diária</option>
                                <option value="weekly">Semanal</option>
                                <option value="monthly">Mensal</option>
                                <option value="yearly">Anual</option>
                            </select>
                        </div>

                        <Input
                            label="Próximo Vencimento"
                            type="date"
                            value={formData.next_due_date}
                            onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
                            required
                        />

                        <Button type="submit" className="w-full mt-6" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Recorrência'}
                        </Button>
                    </form>
                </Card>
            </div>
        </>
    );
};
