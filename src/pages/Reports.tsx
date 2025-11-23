import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { FileText, Download, FileSpreadsheet, Filter } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { Transaction } from '../types';

export const Reports: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

    // Filtros
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        loadTransactions();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [transactions, startDate, endDate, selectedCategory, selectedType]);

    const loadTransactions = async () => {
        try {
            const data = await transactionService.getAll();
            setTransactions(data);

            // Extrair categorias únicas
            const uniqueCategories = Array.from(new Set(data.map(t => t.category)));
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    };

    const applyFilters = () => {
        let filtered = [...transactions];

        // Filtro de data
        if (startDate) {
            filtered = filtered.filter(t => t.date >= startDate);
        }
        if (endDate) {
            filtered = filtered.filter(t => t.date <= endDate);
        }

        // Filtro de categoria
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(t => t.category === selectedCategory);
        }

        // Filtro de tipo
        if (selectedType !== 'all') {
            filtered = filtered.filter(t => t.type === selectedType);
        }

        setFilteredTransactions(filtered);
    };

    const exportPDF = async () => {
        try {
            setLoading(true);
            const doc = new jsPDF();

            doc.setFontSize(20);
            doc.text('Relatório Financeiro', 14, 22);
            doc.setFontSize(11);
            doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`, 14, 30);

            // Adicionar informações de filtros
            let yPos = 38;
            if (startDate || endDate) {
                const period = `Período: ${startDate ? format(new Date(startDate), 'dd/MM/yyyy') : '...'} até ${endDate ? format(new Date(endDate), 'dd/MM/yyyy') : '...'}`;
                doc.text(period, 14, yPos);
                yPos += 6;
            }
            if (selectedCategory !== 'all') {
                doc.text(`Categoria: ${selectedCategory}`, 14, yPos);
                yPos += 6;
            }
            if (selectedType !== 'all') {
                doc.text(`Tipo: ${selectedType === 'income' ? 'Receitas' : 'Despesas'}`, 14, yPos);
                yPos += 6;
            }

            const tableData = filteredTransactions.map(t => [
                format(new Date(t.date), 'dd/MM/yyyy'),
                t.description,
                t.category,
                t.type === 'income' ? 'Receita' : 'Despesa',
                `R$ ${Number(t.amount).toFixed(2)}`
            ]);

            autoTable(doc, {
                head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
                body: tableData,
                startY: yPos + 4,
                styles: { fontSize: 10 },
                headStyles: { fillColor: [15, 23, 42] }
            });

            doc.save('relatorio-financeiro.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = async () => {
        try {
            setLoading(true);
            const headers = ['Data,Descrição,Categoria,Tipo,Valor'];
            const rows = filteredTransactions.map(t => {
                return [
                    t.date,
                    `"${t.description}"`,
                    t.category,
                    t.type,
                    t.amount
                ].join(',');
            });

            const csvContent = [headers, ...rows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', 'relatorio-financeiro.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error generating CSV:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Relatórios</h2>
                <p className="text-text-muted mt-1">Exporte seus dados financeiros</p>
            </div>

            {/* Filtros */}
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-white">Filtros</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Data Inicial</label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Data Final</label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Categoria</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-2 bg-background border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                        >
                            <option value="all">Todas</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Tipo</label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value as 'all' | 'income' | 'expense')}
                            className="w-full px-4 py-2 bg-background border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                        >
                            <option value="all">Todos</option>
                            <option value="income">Receitas</option>
                            <option value="expense">Despesas</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 text-sm text-text-muted">
                    {filteredTransactions.length} transação(ões) encontrada(s)
                </div>
            </Card>

            {/* Cards de exportação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="flex flex-col items-center text-center p-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                        <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Relatório em PDF</h3>
                    <p className="text-text-muted mb-8">
                        Baixe um documento formatado com todas as suas transações, ideal para impressão e arquivamento.
                    </p>
                    <Button onClick={exportPDF} disabled={loading || filteredTransactions.length === 0} className="w-full max-w-xs">
                        <Download className="w-4 h-4 mr-2" />
                        {loading ? 'Gerando...' : 'Baixar PDF'}
                    </Button>
                </Card>

                <Card className="flex flex-col items-center text-center p-8">
                    <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mb-6">
                        <FileSpreadsheet className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Planilha Excel/CSV</h3>
                    <p className="text-text-muted mb-8">
                        Exporte seus dados em formato CSV compatível com Excel, Google Sheets e outros softwares.
                    </p>
                    <Button onClick={exportCSV} disabled={loading || filteredTransactions.length === 0} variant="secondary" className="w-full max-w-xs">
                        <Download className="w-4 h-4 mr-2" />
                        {loading ? 'Gerando...' : 'Baixar CSV'}
                    </Button>
                </Card>
            </div>
        </div>
    );
};
