import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { X } from 'lucide-react';
import { budgetService } from '../services/budgetService';
import { useAuth } from '../contexts/AuthContext';
import { categoryService, type Category } from '../services/categoryService';
import { CategoryModal } from './CategoryModal';

import type { Budget } from '../types';

interface BudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    month: string; // formato: YYYY-MM
    budgetToEdit?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, onSuccess, month, budgetToEdit }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        category: '',
        amount: ''
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            await categoryService.initializeDefaults();
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    useEffect(() => {
        if (budgetToEdit) {
            setFormData({
                category: budgetToEdit.category,
                amount: budgetToEdit.amount.toString()
            });
        } else {
            setFormData({ category: '', amount: '' });
        }
    }, [budgetToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            console.error('User not authenticated');
            return;
        }
        try {
            setLoading(true);

            if (budgetToEdit) {
                await budgetService.update(budgetToEdit.id, {
                    amount: Number(formData.amount)
                });
            } else {
                await budgetService.create({
                    user_id: user.id,
                    category: formData.category,
                    amount: Number(formData.amount),
                    month
                });
            }

            setFormData({ category: '', amount: '' });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving budget:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md relative">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-muted hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">
                    {budgetToEdit ? 'Editar Orçamento' : 'Novo Orçamento'}
                </h2>
                <p className="text-text-muted text-sm mb-6">
                    Defina um limite de gastos para {new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Categoria</label>
                        <div className="flex gap-2">
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="flex-1 px-4 py-2 bg-background border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                                required
                                disabled={!!budgetToEdit}
                            >
                                <option value="">Selecione...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>
                                        {cat.name} ({cat.type === 'income' ? 'Receita' : 'Despesa'})
                                    </option>
                                ))}
                            </select>
                            {!budgetToEdit && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCategoryModalOpen(true)}
                                    className="px-3"
                                    title="Nova Categoria"
                                >
                                    +
                                </Button>
                            )}
                        </div>
                    </div>

                    <Input
                        label="Limite de Gastos"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0,00"
                        required
                    />

                    <Button type="submit" className="w-full mt-6" disabled={loading}>
                        {loading ? 'Salvando...' : (budgetToEdit ? 'Atualizar Orçamento' : 'Criar Orçamento')}
                    </Button>
                </form>
            </Card>

            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onSuccess={async (newCategory) => {
                    await loadCategories();
                    if (newCategory) {
                        setFormData(prev => ({
                            ...prev,
                            category: newCategory.name
                        }));
                    }
                }}
            />
        </div>
    );
};
