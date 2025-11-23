import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';

export const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [resetSent, setResetSent] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setError(null);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/`,
                },
            });

            if (error) throw error;
        } catch (err) {
            setError('Erro ao conectar com Google');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!email) {
            setError('Digite seu email para recuperar a senha');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setResetSent(true);
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar email de recuperação');
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
                    <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta</h1>
                    <p className="text-text-muted">Entre para gerenciar suas finanças</p>
                </div>

                <Card>
                    {error && (
                        <div className="bg-danger/10 text-danger p-3 rounded-lg mb-4 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {resetSent && (
                        <div className="bg-success/10 text-success p-3 rounded-lg mb-4 text-sm font-medium">
                            Email de recuperação enviado! Verifique sua caixa de entrada.
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleEmailLogin}>
                        <Input
                            label="Email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <div>
                            <Input
                                label="Senha"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <div className="flex justify-end mt-1">
                                <button
                                    type="button"
                                    onClick={handleResetPassword}
                                    className="text-xs text-primary hover:text-primary-hover"
                                >
                                    Esqueci minha senha
                                </button>
                            </div>
                        </div>

                        <Button className="w-full" size="lg" type="submit" disabled={loading}>
                            {loading ? 'Entrando...' : 'Entrar'}
                        </Button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-surface text-text-muted">Ou continue com</span>
                            </div>
                        </div>

                        <Button
                            variant="secondary"
                            className="w-full"
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 mr-2" />
                            {loading ? 'Conectando...' : 'Google'}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-text-muted">
                        Não tem uma conta?{' '}
                        <Link to="/register" className="text-primary hover:text-primary-hover font-medium">
                            Criar conta
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
};
