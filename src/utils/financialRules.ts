import type { Transaction } from '../types';

export interface FinancialHealthScore {
    score: number;
    savingsRate: number;
    expenseRatio: number;
    categoryDiversity: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface BudgetRule {
    name: string;
    actual: number;
    target: number;
    status: 'good' | 'warning' | 'critical';
}

export const calculateFinancialHealth = (transactions: Transaction[]): FinancialHealthScore => {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    // Taxa de poupança (quanto % da renda está sendo poupado)
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    // Relação despesas/renda
    const expenseRatio = income > 0 ? (expenses / income) * 100 : 0;

    // Diversificação de categorias (quanto mais categorias, melhor o controle)
    const categories = new Set(transactions.filter(t => t.type === 'expense').map(t => t.category));
    const categoryDiversity = Math.min((categories.size / 10) * 100, 100);

    // Cálculo do score (0-100)
    let score = 0;

    // Poupança (40 pontos)
    if (savingsRate >= 20) score += 40;
    else if (savingsRate >= 10) score += 30;
    else if (savingsRate >= 5) score += 20;
    else if (savingsRate > 0) score += 10;

    // Controle de gastos (40 pontos)
    if (expenseRatio <= 70) score += 40;
    else if (expenseRatio <= 80) score += 30;
    else if (expenseRatio <= 90) score += 20;
    else if (expenseRatio < 100) score += 10;

    // Diversificação (20 pontos)
    score += (categoryDiversity / 100) * 20;

    // Status
    let status: FinancialHealthScore['status'];
    if (score >= 80) status = 'excellent';
    else if (score >= 60) status = 'good';
    else if (score >= 40) status = 'warning';
    else status = 'critical';

    return {
        score: Math.round(score),
        savingsRate: Math.round(savingsRate),
        expenseRatio: Math.round(expenseRatio),
        categoryDiversity: Math.round(categoryDiversity),
        status
    };
};

export const calculate50_30_20Rule = (transactions: Transaction[]): BudgetRule[] => {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    // Categorias essenciais (necessidades)
    const essentialCategories = ['Moradia', 'Alimentação', 'Transporte', 'Saúde'];
    const essentials = transactions
        .filter(t => t.type === 'expense' && essentialCategories.includes(t.category))
        .reduce((sum, t) => sum + Number(t.amount), 0);

    // Poupança
    const savings = income - expenses;

    // Desejos (resto)
    const wants = expenses - essentials;

    const essentialsPercent = income > 0 ? (essentials / income) * 100 : 0;
    const wantsPercent = income > 0 ? (wants / income) * 100 : 0;
    const savingsPercent = income > 0 ? (savings / income) * 100 : 0;

    return [
        {
            name: 'Necessidades',
            actual: Math.round(essentialsPercent),
            target: 50,
            status: essentialsPercent <= 55 ? 'good' : essentialsPercent <= 65 ? 'warning' : 'critical'
        },
        {
            name: 'Desejos',
            actual: Math.round(wantsPercent),
            target: 30,
            status: wantsPercent <= 35 ? 'good' : wantsPercent <= 45 ? 'warning' : 'critical'
        },
        {
            name: 'Poupança',
            actual: Math.round(savingsPercent),
            target: 20,
            status: savingsPercent >= 15 ? 'good' : savingsPercent >= 10 ? 'warning' : 'critical'
        }
    ];
};

export const getTips = (health: FinancialHealthScore, transactions: Transaction[]): string[] => {
    const tips: string[] = [];

    // Dicas baseadas na taxa de poupança
    if (health.savingsRate < 10) {
        tips.push("💡 Comece poupando pelo menos 10% da sua renda - 'Pague a si mesmo primeiro' (O Homem Mais Rico da Babilônia)");
    }

    // Dicas baseadas no controle de gastos
    if (health.expenseRatio > 90) {
        tips.push("⚠️ Seus gastos estão muito altos! Lembre-se: 'Não gaste mais do que você ganha' - Lei de Ouro das Finanças");
    }

    // Dicas baseadas em categorias
    const categories = new Set(transactions.filter(t => t.type === 'expense').map(t => t.category));
    if (categories.size < 3) {
        tips.push("📊 Organize melhor seus gastos em categorias para ter mais controle financeiro");
    }

    // Dicas motivacionais
    if (health.score >= 80) {
        tips.push("🎉 Parabéns! Você está no caminho certo para a prosperidade financeira!");
    } else if (health.score >= 60) {
        tips.push("👍 Bom trabalho! Continue melhorando seus hábitos financeiros");
    }

    // Sempre adicionar uma dica motivacional
    if (tips.length === 0) {
        tips.push("🌟 'Sua renda só pode crescer na medida em que você cresce' - T. Harv Eker");
    }

    return tips;
};
