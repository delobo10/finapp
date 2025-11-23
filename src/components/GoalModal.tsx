import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { X } from 'lucide-react';
import { goalService } from '../services/goalService';

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        target_amount: '',
        deadline: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await goalService.create({
                name: formData.name,
                target_amount: Number(formData.target_amount),
                deadline: formData.deadline
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating goal:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-muted hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6">Nova Meta</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nome da Meta"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Viagem, Carro Novo..."
                        required
                    />

                    <Input
                        label="Valor Alvo"
                        type="number"
                        step="0.01"
                        value={formData.target_amount}
                        onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                        required
                    />

                    <Input
                        label="Prazo"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        required
                    />

                    <Button type="submit" className="w-full mt-6" disabled={loading}>
                        {loading ? 'Salvando...' : 'Criar Meta'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};
