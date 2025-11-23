import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Wallet } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

export const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we have a session (which happens after clicking the email link)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // If no session, maybe redirect to login or show error
                // But for the reset flow, supabase usually sets the session via the hash fragment
            }
        });
    }, []);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;
            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar senha');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/25 mx-auto mb-6">
                        <Wallet className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Redefinir Senha</h1>
                    <p className="text-text-muted">Digite sua nova senha abaixo</p>
                </div>

                <Card>
                    {error && (
                        <div className="bg-danger/10 text-danger p-3 rounded-lg mb-4 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="text-center py-4">
                            <div className="text-success text-xl font-bold mb-2">Senha atualizada!</div>
                            <p className="text-text-muted">Você será redirecionado em instantes...</p>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleUpdatePassword}>
                            <Input
                                label="Nova Senha"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />

                            <Button className="w-full" size="lg" type="submit" disabled={loading}>
                                {loading ? 'Atualizando...' : 'Atualizar Senha'}
                            </Button>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
};
