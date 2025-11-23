import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { BookOpen, TrendingUp, Target, Lightbulb, Award, AlertCircle } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import type { Transaction } from '../types';
import { financialQuotes, financialPrinciples } from '../data/financialWisdom';
import { calculateFinancialHealth, calculate50_30_20Rule, getTips } from '../utils/financialRules';

export const FinancialEducation: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await transactionService.getAll();
            setTransactions(data);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const health = calculateFinancialHealth(transactions);
    const budgetRules = calculate50_30_20Rule(transactions);
    const tips = getTips(health, transactions);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-success';
        if (score >= 60) return 'text-primary';
        if (score >= 40) return 'text-warning';
        return 'text-danger';
    };

    const getScoreGradient = (score: number) => {
        if (score >= 80) return 'from-emerald-500 to-teal-500';
        if (score >= 60) return 'from-blue-500 to-cyan-500';
        if (score >= 40) return 'from-amber-500 to-yellow-500';
        return 'from-red-500 to-orange-500';
    };

    const getStatusIcon = (status: string) => {
        if (status === 'good') return '✅';
        if (status === 'warning') return '⚠️';
        return '❌';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Educação Financeira</h2>
                <p className="text-text-muted mt-1">Aprenda e aplique princípios de riqueza</p>
            </div>

            {/* Health Score */}
            <Card className="relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${getScoreGradient(health.score)} opacity-10 rounded-full blur-3xl`}></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                        <Award className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-bold text-white">Sua Saúde Financeira</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col items-center justify-center">
                            <div className="relative w-48 h-48">
                                <svg className="transform -rotate-90 w-48 h-48">
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        className="text-slate-800"
                                    />
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        strokeDasharray={`${(health.score / 100) * 553} 553`}
                                        className={getScoreColor(health.score)}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-5xl font-bold ${getScoreColor(health.score)}`}>
                                        {health.score}
                                    </span>
                                    <span className="text-text-muted text-sm mt-1">de 100</span>
                                </div>
                            </div>
                            <p className="text-center text-text-muted mt-4">
                                {health.status === 'excellent' && '🎉 Excelente! Continue assim!'}
                                {health.status === 'good' && '👍 Bom trabalho! Você está no caminho certo'}
                                {health.status === 'warning' && '⚠️ Atenção! Há espaço para melhorias'}
                                {health.status === 'critical' && '🚨 Crítico! É hora de agir'}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-text-muted">Taxa de Poupança</span>
                                    <span className="text-white font-semibold">{health.savingsRate}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-success transition-all"
                                        style={{ width: `${Math.min(health.savingsRate, 100)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-text-muted mt-1">Meta: 20% ou mais</p>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-text-muted">Gastos vs Renda</span>
                                    <span className="text-white font-semibold">{health.expenseRatio}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${health.expenseRatio > 90 ? 'bg-danger' : health.expenseRatio > 80 ? 'bg-warning' : 'bg-success'}`}
                                        style={{ width: `${Math.min(health.expenseRatio, 100)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-text-muted mt-1">Meta: 70% ou menos</p>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-text-muted">Controle de Categorias</span>
                                    <span className="text-white font-semibold">{health.categoryDiversity}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${health.categoryDiversity}%` }}
                                    />
                                </div>
                                <p className="text-xs text-text-muted mt-1">Quanto mais categorias, melhor o controle</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Budget Rules */}
            <Card>
                <div className="flex items-center gap-2 mb-6">
                    <Target className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-white">Regra 50/30/20</h3>
                </div>
                <p className="text-text-muted mb-6">
                    Divida sua renda em: 50% necessidades, 30% desejos, 20% poupança
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {budgetRules.map((rule) => (
                        <div key={rule.name} className="bg-surface rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white font-semibold">{rule.name}</span>
                                <span className="text-2xl">{getStatusIcon(rule.status)}</span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-3xl font-bold text-white">{rule.actual}%</span>
                                <span className="text-text-muted text-sm">/ {rule.target}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all ${rule.status === 'good' ? 'bg-success' :
                                            rule.status === 'warning' ? 'bg-warning' : 'bg-danger'
                                        }`}
                                    style={{ width: `${Math.min((rule.actual / rule.target) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Tips */}
            <Card>
                <div className="flex items-center gap-2 mb-6">
                    <Lightbulb className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-white">Dicas Personalizadas</h3>
                </div>
                <div className="space-y-3">
                    {tips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-surface rounded-lg">
                            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <p className="text-white">{tip}</p>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Principles */}
            <Card>
                <div className="flex items-center gap-2 mb-6">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-white">Princípios Fundamentais</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {financialPrinciples.map((principle, index) => (
                        <div key={index} className="bg-surface rounded-lg p-6">
                            <h4 className="text-lg font-bold text-white mb-2">{principle.title}</h4>
                            <p className="text-text-muted mb-3">{principle.description}</p>
                            <div className="flex items-center gap-2 text-sm text-primary">
                                <TrendingUp className="w-4 h-4" />
                                <span>{principle.source}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* All Quotes */}
            <Card>
                <div className="flex items-center gap-2 mb-6">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-white">Biblioteca de Sabedoria</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {financialQuotes.map((quote, index) => (
                        <div key={index} className="bg-surface rounded-lg p-6">
                            <blockquote className="text-white italic mb-3">
                                "{quote.text}"
                            </blockquote>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-muted">{quote.author}</span>
                                <span className="text-primary">{quote.book}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};
