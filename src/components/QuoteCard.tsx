import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Sparkles, RefreshCw, BookOpen } from 'lucide-react';
import { getRandomQuote, type FinancialQuote } from '../data/financialWisdom';

export const QuoteCard: React.FC = () => {
    const [quote, setQuote] = useState<FinancialQuote>(getRandomQuote());
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshQuote = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setQuote(getRandomQuote());
            setIsRefreshing(false);
        }, 300);
    };

    useEffect(() => {
        // Trocar frase diariamente
        const lastQuoteDate = localStorage.getItem('lastQuoteDate');
        const today = new Date().toDateString();

        if (lastQuoteDate !== today) {
            setQuote(getRandomQuote());
            localStorage.setItem('lastQuoteDate', today);
        }
    }, []);

    const categoryColors = {
        mindset: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
        saving: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
        investing: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
        wealth: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
        discipline: 'from-red-500/20 to-orange-500/20 border-red-500/30'
    };

    const categoryIcons = {
        mindset: '🧠',
        saving: '💰',
        investing: '📈',
        wealth: '💎',
        discipline: '🎯'
    };

    return (
        <Card className={`relative overflow-hidden bg-gradient-to-br ${categoryColors[quote.category]} border`}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-32 h-32 text-white" />
            </div>

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-2xl">
                            {categoryIcons[quote.category]}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">Frase do Dia</h3>
                            <p className="text-xs text-text-muted capitalize">{quote.category === 'mindset' ? 'Mentalidade' : quote.category === 'saving' ? 'Poupança' : quote.category === 'investing' ? 'Investimento' : quote.category === 'wealth' ? 'Riqueza' : 'Disciplina'}</p>
                        </div>
                    </div>
                    <button
                        onClick={refreshQuote}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Nova frase"
                    >
                        <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <blockquote className="mb-4">
                    <p className="text-lg font-medium text-white leading-relaxed italic">
                        "{quote.text}"
                    </p>
                </blockquote>

                <div className="flex items-center gap-2 text-sm text-text-muted">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-medium">{quote.author}</span>
                    <span>•</span>
                    <span>{quote.book}</span>
                </div>
            </div>
        </Card>
    );
};
