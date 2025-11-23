export interface FinancialQuote {
    text: string;
    author: string;
    book: string;
    category: 'mindset' | 'saving' | 'investing' | 'wealth' | 'discipline';
}

export const financialQuotes: FinancialQuote[] = [
    // O Homem Mais Rico da Babilônia
    {
        text: "Pague a si mesmo primeiro. Reserve pelo menos 10% de tudo que você ganhar.",
        author: "George S. Clason",
        book: "O Homem Mais Rico da Babilônia",
        category: "saving"
    },
    {
        text: "A riqueza, como uma árvore, cresce a partir de uma pequena semente.",
        author: "George S. Clason",
        book: "O Homem Mais Rico da Babilônia",
        category: "wealth"
    },
    {
        text: "Não gaste mais do que você ganha. Esta é a lei de ouro das finanças.",
        author: "George S. Clason",
        book: "O Homem Mais Rico da Babilônia",
        category: "discipline"
    },
    {
        text: "Faça do ouro seu escravo. Faça-o trabalhar para você.",
        author: "George S. Clason",
        book: "O Homem Mais Rico da Babilônia",
        category: "investing"
    },

    // Pai Rico Pai Pobre
    {
        text: "Os ricos adquirem ativos. Os pobres e a classe média adquirem passivos.",
        author: "Robert Kiyosaki",
        book: "Pai Rico Pai Pobre",
        category: "wealth"
    },
    {
        text: "Não trabalhe pelo dinheiro. Faça o dinheiro trabalhar para você.",
        author: "Robert Kiyosaki",
        book: "Pai Rico Pai Pobre",
        category: "investing"
    },
    {
        text: "A educação financeira é a base da riqueza.",
        author: "Robert Kiyosaki",
        book: "Pai Rico Pai Pobre",
        category: "mindset"
    },
    {
        text: "O medo de perder dinheiro é real. Todos o têm. Mas não deixe que ele controle você.",
        author: "Robert Kiyosaki",
        book: "Pai Rico Pai Pobre",
        category: "mindset"
    },

    // Os Segredos da Mente Milionária
    {
        text: "Sua renda só pode crescer na medida em que você cresce.",
        author: "T. Harv Eker",
        book: "Os Segredos da Mente Milionária",
        category: "mindset"
    },
    {
        text: "Pessoas ricas administram bem o seu dinheiro. Pessoas pobres desperdiçam o seu dinheiro.",
        author: "T. Harv Eker",
        book: "Os Segredos da Mente Milionária",
        category: "discipline"
    },
    {
        text: "Se você quer mudar os frutos, primeiro deve mudar as raízes.",
        author: "T. Harv Eker",
        book: "Os Segredos da Mente Milionária",
        category: "mindset"
    },
    {
        text: "Pessoas ricas pensam grande. Pessoas pobres pensam pequeno.",
        author: "T. Harv Eker",
        book: "Os Segredos da Mente Milionária",
        category: "wealth"
    },

    // Quem Pensa Enriquece
    {
        text: "Tudo o que a mente pode conceber e acreditar, ela pode realizar.",
        author: "Napoleon Hill",
        book: "Quem Pensa Enriquece",
        category: "mindset"
    },
    {
        text: "A persistência é para o caráter do homem o que o carbono é para o aço.",
        author: "Napoleon Hill",
        book: "Quem Pensa Enriquece",
        category: "discipline"
    },
    {
        text: "O ponto de partida de toda realização é o desejo.",
        author: "Napoleon Hill",
        book: "Quem Pensa Enriquece",
        category: "mindset"
    },

    // Frases Adicionais de Motivação
    {
        text: "Pequenas economias diárias se transformam em grandes fortunas ao longo do tempo.",
        author: "Provérbio Financeiro",
        book: "Sabedoria Popular",
        category: "saving"
    },
    {
        text: "O melhor momento para começar a poupar foi ontem. O segundo melhor momento é agora.",
        author: "Provérbio Chinês",
        book: "Sabedoria Popular",
        category: "saving"
    },
    {
        text: "Investir em conhecimento rende sempre os melhores juros.",
        author: "Benjamin Franklin",
        book: "Sabedoria Popular",
        category: "mindset"
    }
];

export interface FinancialPrinciple {
    title: string;
    description: string;
    rule: string;
    source: string;
}

export const financialPrinciples: FinancialPrinciple[] = [
    {
        title: "Regra 50/30/20",
        description: "Divida sua renda em: 50% necessidades, 30% desejos, 20% poupança e investimentos",
        rule: "50/30/20",
        source: "Elizabeth Warren"
    },
    {
        title: "Pague-se Primeiro",
        description: "Reserve 10% de toda renda antes de pagar qualquer conta",
        rule: "10% savings",
        source: "O Homem Mais Rico da Babilônia"
    },
    {
        title: "Fundo de Emergência",
        description: "Mantenha de 3 a 6 meses de despesas guardadas para emergências",
        rule: "3-6 months",
        source: "Planejamento Financeiro"
    },
    {
        title: "Regra dos 70/30",
        description: "Use 70% da renda para viver e 30% para poupar e investir",
        rule: "70/30",
        source: "Educação Financeira"
    }
];

export const getRandomQuote = (): FinancialQuote => {
    const randomIndex = Math.floor(Math.random() * financialQuotes.length);
    return financialQuotes[randomIndex];
};

export const getQuotesByCategory = (category: FinancialQuote['category']): FinancialQuote[] => {
    return financialQuotes.filter(q => q.category === category);
};
