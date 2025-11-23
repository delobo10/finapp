import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { X } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { categoryService, type Category } from '../services/categoryService';
import { CategoryModal } from './CategoryModal';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'expense' as 'income' | 'expense',
        category: '',
        date: new Date().toISOString().split('T')[0]
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
        try {
            setLoading(true);
            await transactionService.create({
                description: formData.description,
                amount: Number(formData.amount),
                type: formData.type,
                category: formData.category,
                date: formData.date
            });
            onSuccess();
            window.dispatchEvent(new CustomEvent('transaction-updated'));
            onClose();
            setFormData({
                description: '',
                amount: '',
                type: 'expense',
                category: '',
                date: new Date().toISOString().split('T')[0]
            });
        } catch (error: any) {
            console.error('Erro ao criar transação:', error);
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
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-text-muted hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <h2 className="text-2xl font-bold text-white mb-6">Nova Transação</h2>

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
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCategoryModalOpen(true)}
                                    className="px-3"
                                    title="Nova Categoria"
                                >
                                    +
                                </Button>
                            </div>
                        </div>

                        <Input
                            label="Data"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />

                        <Button type="submit" className="w-full mt-6" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Transação'}
                        </Button>
                    </form>
                </Card>
            </div>

            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onSuccess={async (newCategory) => {
                    await loadCategories();
                    if (newCategory) {
                        setFormData(prev => ({
                            ...prev,
                            type: newCategory.type,
                            category: newCategory.name
                        }));
                    }
                }}
            />
        </>
    );
};
