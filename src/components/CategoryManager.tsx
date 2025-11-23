import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Plus, Trash2, Edit2, X, Check, Tag } from 'lucide-react';
import { categoryService, type Category } from '../services/categoryService';

export const CategoryManager: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState({ name: '', type: 'expense' as 'income' | 'expense', color: '#3b82f6' });
    const [editForm, setEditForm] = useState({ name: '', color: '' });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            await categoryService.initializeDefaults(); // Ensure defaults exist
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await categoryService.create(newCategory);
            setNewCategory({ name: '', type: 'expense', color: '#3b82f6' });
            loadCategories();
        } catch (error) {
            console.error('Error adding category:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza? Isso não afetará transações passadas, mas removerá a opção de novos lançamentos.')) {
            try {
                await categoryService.delete(id);
                loadCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    const startEdit = (category: Category) => {
        setEditingId(category.id);
        setEditForm({ name: category.name, color: category.color || '#3b82f6' });
    };

    const saveEdit = async (id: string) => {
        try {
            await categoryService.update(id, editForm);
            setEditingId(null);
            loadCategories();
        } catch (error) {
            console.error('Error updating category:', error);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    return (
        <Card>
            <div className="flex items-center gap-2 mb-6">
                <Tag className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-white">Gerenciar Categorias</h3>
            </div>

            {/* Add New Form */}
            <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 mb-8 bg-surface/50 p-4 rounded-xl border border-slate-800">
                <div className="flex-1">
                    <Input
                        placeholder="Nome da nova categoria"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        required
                    />
                </div>
                <div className="w-full md:w-32">
                    <select
                        value={newCategory.type}
                        onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'income' | 'expense' })}
                        className="w-full px-4 py-2 bg-background border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary transition-colors h-[42px]"
                    >
                        <option value="expense">Despesa</option>
                        <option value="income">Receita</option>
                    </select>
                </div>
                <div className="w-full md:w-20">
                    <input
                        type="color"
                        value={newCategory.color}
                        onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                        className="w-full h-[42px] rounded-lg cursor-pointer bg-transparent border border-slate-700"
                    />
                </div>
                <Button type="submit" disabled={!newCategory.name}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                </Button>
            </form>

            {/* List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {loading ? (
                    <p className="text-text-muted text-center">Carregando...</p>
                ) : categories.length === 0 ? (
                    <p className="text-text-muted text-center">Nenhuma categoria encontrada.</p>
                ) : (
                    categories.map((category) => (
                        <div key={category.id} className="flex items-center justify-between p-3 bg-surface/30 rounded-lg hover:bg-surface/50 transition-colors group">
                            {editingId === category.id ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <input
                                        type="color"
                                        value={editForm.color}
                                        onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                    />
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="flex-1 bg-background border border-slate-700 rounded px-2 py-1 text-white text-sm"
                                        autoFocus
                                    />
                                    <button onClick={() => saveEdit(category.id)} className="p-1 text-success hover:bg-success/10 rounded">
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button onClick={cancelEdit} className="p-1 text-danger hover:bg-danger/10 rounded">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: category.color || '#3b82f6' }}
                                        />
                                        <span className="text-white font-medium">{category.name}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${category.type === 'income'
                                            ? 'border-success/20 text-success bg-success/5'
                                            : 'border-danger/20 text-danger bg-danger/5'
                                            }`}>
                                            {category.type === 'income' ? 'Receita' : 'Despesa'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEdit(category)}
                                            className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};
