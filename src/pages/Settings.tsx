import React, { useState } from 'react';
import { CategoryManager } from '../components/CategoryManager';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Shield, LogOut, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export const Settings: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setMessage(null);
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
            setMessage({ type: 'success', text: 'Senha atualizada com sucesso!' });
            setNewPassword('');
            setTimeout(() => {
                setIsChangePasswordOpen(false);
                setMessage(null);
            }, 2000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Erro ao atualizar senha' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Configurações</h2>
                <p className="text-text-muted mt-1">Gerencie sua conta e preferências</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar / Profile Summary */}
                <div className="space-y-6">
                    <Card>
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-4xl">
                                👤
                            </div>
                            <h3 className="text-xl font-bold text-white break-all">{user?.email}</h3>
                            <p className="text-text-muted text-sm mt-1">Membro desde {new Date().getFullYear()}</p>

                            <Button
                                variant="secondary"
                                className="w-full mt-6 flex items-center justify-center gap-2 text-danger hover:text-danger hover:bg-danger/10 border-danger/20"
                                onClick={handleSignOut}
                            >
                                <LogOut className="w-4 h-4" />
                                Sair da Conta
                            </Button>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="w-5 h-5 text-primary" />
                            <h3 className="font-bold text-white">Segurança</h3>
                        </div>
                        <div className="space-y-4">
                            <Button
                                variant="secondary"
                                className="w-full justify-start"
                                onClick={() => setIsChangePasswordOpen(true)}
                            >
                                Alterar Senha
                            </Button>
                            <div className="pt-4 border-t border-slate-800">
                                <p className="text-xs text-text-muted mb-3">Zona de Perigo</p>
                                <Button variant="secondary" className="w-full justify-start text-danger hover:text-danger hover:bg-danger/10 border-danger/20">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir Conta
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Settings Area */}
                <div className="lg:col-span-2 space-y-8">
                    <CategoryManager />

                    {/* Add more settings sections here later */}
                </div>
            </div>

            {/* Change Password Modal */}
            {isChangePasswordOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md relative">
                        <button
                            onClick={() => setIsChangePasswordOpen(false)}
                            className="absolute top-4 right-4 text-text-muted hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-6">Alterar Senha</h2>

                        {message && (
                            <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${message.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <Input
                                label="Nova Senha"
                                type="password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                            />

                            <Button type="submit" className="w-full mt-6" disabled={loading}>
                                {loading ? 'Atualizando...' : 'Atualizar Senha'}
                            </Button>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};
