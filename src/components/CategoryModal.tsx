import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { X } from 'lucide-react';
import { categoryService, type Category } from '../services/categoryService';
import { useAuth } from '../contexts/AuthContext';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (category?: Category) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setLoading(true);
            const newCategory = await categoryService.create({
                name: name.trim(),
                type,
                icon: 'Tag', // Default icon
                color: '#3b82f6' // Default color
            });
            setName('');
            onSuccess(newCategory);
            onClose();
        } catch (error) {
            console.error('Error creating category:', error);
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

                <h2 className="text-2xl font-bold text-white mb-6">Nova Categoria</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4 mb-4">
                        <button
                            type="button"
                            onClick={() => setType('income')}
                            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${type === 'income'
                                ? 'bg-success text-white'
                                : 'bg-surface text-text-muted hover:bg-slate-700'
                                }`}
                        >
                            Receita
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('expense')}
                            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${type === 'expense'
                                ? 'bg-danger text-white'
                                : 'bg-surface text-text-muted hover:bg-slate-700'
                                }`}
                        >
                            Despesa
                        </button>
                    </div>

                    <Input
                        label="Nome da Categoria"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Alimentação, Transporte..."
                        required
                        autoFocus
                    />

                    <Button type="submit" className="w-full mt-6" disabled={loading}>
                        {loading ? 'Salvando...' : 'Adicionar Categoria'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};
