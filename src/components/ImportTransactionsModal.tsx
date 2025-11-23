import React, { useState, useRef } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { X, Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { transactionService } from '../services/transactionService';

interface ImportTransactionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const ImportTransactionsModal: React.FC<ImportTransactionsModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState<'upload' | 'preview'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [csvData, setCsvData] = useState<string[][]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [columnMapping, setColumnMapping] = useState({
        date: -1,
        description: -1,
        amount: -1,
        type: -1,
        category: -1
    });

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };

    const parseCSV = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').map(line => line.trim()).filter(line => line);
            // Simple CSV split, assuming no commas in quoted fields for MVP
            const data = lines.map(line => line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));

            if (data.length > 0) {
                setHeaders(data[0]);
                setCsvData(data.slice(1));
                setStep('preview');

                // Auto-detect columns
                const lowerHeaders = data[0].map(h => h.toLowerCase());
                setColumnMapping({
                    date: lowerHeaders.findIndex(h => h.includes('data') || h.includes('date')),
                    description: lowerHeaders.findIndex(h => h.includes('desc') || h.includes('memo') || h.includes('histórico')),
                    amount: lowerHeaders.findIndex(h => h.includes('valor') || h.includes('amount')),
                    type: lowerHeaders.findIndex(h => h.includes('tipo') || h.includes('type') || h.includes('d/c')),
                    category: lowerHeaders.findIndex(h => h.includes('cat'))
                });
            }
        };
        reader.readAsText(file);
    };

    const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date().toISOString().split('T')[0];
        // Try DD/MM/YYYY
        const ptBRMatch = dateStr.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
        if (ptBRMatch) {
            return `${ptBRMatch[3]}-${ptBRMatch[2].padStart(2, '0')}-${ptBRMatch[1].padStart(2, '0')}`;
        }
        // Try YYYY-MM-DD
        const isoMatch = dateStr.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
        if (isoMatch) {
            return `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
        }
        return dateStr;
    };

    const handleImport = async () => {
        if (columnMapping.date === -1 || columnMapping.amount === -1 || columnMapping.description === -1) {
            alert('Por favor, mapeie as colunas obrigatórias (Data, Descrição, Valor).');
            return;
        }

        try {
            setLoading(true);
            const transactions = csvData.map(row => {
                const amountStr = row[columnMapping.amount] || '0';
                // Remove currency symbols and handle comma as decimal if needed (pt-BR)
                // Assuming format like "1.234,56" or "1234.56"
                let cleanAmount = amountStr.replace(/[R$\s]/g, '');
                if (cleanAmount.includes(',') && cleanAmount.includes('.')) {
                    // 1.234,56 -> 1234.56
                    cleanAmount = cleanAmount.replace(/\./g, '').replace(',', '.');
                } else if (cleanAmount.includes(',')) {
                    // 1234,56 -> 1234.56
                    cleanAmount = cleanAmount.replace(',', '.');
                }

                const amount = parseFloat(cleanAmount);

                let type: 'income' | 'expense' = 'expense';

                // Logic for type
                if (columnMapping.type !== -1) {
                    const typeStr = (row[columnMapping.type] || '').toLowerCase();
                    if (typeStr.includes('c') || typeStr.includes('receita') || typeStr.includes('crédito')) {
                        type = 'income';
                    }
                } else {
                    // Infer from amount sign
                    if (amount > 0) type = 'income';
                    // If amount is negative, it's expense.
                    // Note: Some CSVs use positive for both and rely on type column.
                    // If no type column, we assume negative is expense.
                    // If amount is positive and no type column, default to income? Or expense?
                    // Let's assume if amount > 0 it's income, < 0 expense.
                    // BUT often expenses are listed as positive numbers in "Debit" columns.
                    // Without type column, it's hard.
                    // Let's assume standard bank export: -100.00 is expense.
                }

                return {
                    date: parseDate(row[columnMapping.date]),
                    description: row[columnMapping.description] || 'Sem descrição',
                    amount: Math.abs(amount),
                    type: amount < 0 ? 'expense' : type,
                    category: columnMapping.category !== -1 ? (row[columnMapping.category] || 'Outros') : 'Outros',
                };
            }).filter(t => !isNaN(t.amount) && t.amount !== 0);

            await transactionService.bulkCreate(transactions);

            onSuccess();
            window.dispatchEvent(new CustomEvent('transaction-updated'));
            onClose();

            // Reset state
            setFile(null);
            setCsvData([]);
            setStep('upload');
        } catch (error) {
            console.error('Import error:', error);
            alert('Erro ao importar transações. Verifique o console.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-muted hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6">Importar Transações (CSV)</h2>

                {step === 'upload' ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-xl hover:border-primary transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}>
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <Upload className="w-12 h-12 text-text-muted mx-auto mb-4" />
                        <p className="text-lg text-white font-medium mb-2">Clique para selecionar o arquivo CSV</p>
                        <p className="text-text-muted">Extratos bancários exportados em CSV</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 p-4 bg-surface/50 rounded-lg border border-slate-700">
                            <FileText className="w-6 h-6 text-primary" />
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{file?.name}</p>
                                <p className="text-sm text-text-muted">{csvData.length} transações encontradas</p>
                            </div>
                            <button
                                onClick={() => { setStep('upload'); setFile(null); }}
                                className="text-sm text-danger hover:underline"
                            >
                                Trocar arquivo
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Coluna de Data *</label>
                                <select
                                    value={columnMapping.date}
                                    onChange={(e) => setColumnMapping({ ...columnMapping, date: Number(e.target.value) })}
                                    className="w-full px-3 py-2 bg-background border border-slate-700 rounded-lg text-white"
                                >
                                    <option value={-1}>Selecione...</option>
                                    {headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Coluna de Descrição *</label>
                                <select
                                    value={columnMapping.description}
                                    onChange={(e) => setColumnMapping({ ...columnMapping, description: Number(e.target.value) })}
                                    className="w-full px-3 py-2 bg-background border border-slate-700 rounded-lg text-white"
                                >
                                    <option value={-1}>Selecione...</option>
                                    {headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Coluna de Valor *</label>
                                <select
                                    value={columnMapping.amount}
                                    onChange={(e) => setColumnMapping({ ...columnMapping, amount: Number(e.target.value) })}
                                    className="w-full px-3 py-2 bg-background border border-slate-700 rounded-lg text-white"
                                >
                                    <option value={-1}>Selecione...</option>
                                    {headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Coluna de Tipo (Opcional)</label>
                                <select
                                    value={columnMapping.type}
                                    onChange={(e) => setColumnMapping({ ...columnMapping, type: Number(e.target.value) })}
                                    className="w-full px-3 py-2 bg-background border border-slate-700 rounded-lg text-white"
                                >
                                    <option value={-1}>Selecione...</option>
                                    {headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Coluna de Categoria (Opcional)</label>
                                <select
                                    value={columnMapping.category}
                                    onChange={(e) => setColumnMapping({ ...columnMapping, category: Number(e.target.value) })}
                                    className="w-full px-3 py-2 bg-background border border-slate-700 rounded-lg text-white"
                                >
                                    <option value={-1}>Selecione...</option>
                                    {headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-4">
                            <h4 className="text-sm font-bold text-white mb-3">Pré-visualização (primeiras 3 linhas)</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead>
                                        <tr className="text-text-muted border-b border-slate-700">
                                            <th className="pb-2">Data</th>
                                            <th className="pb-2">Descrição</th>
                                            <th className="pb-2">Valor</th>
                                            <th className="pb-2">Tipo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {csvData.slice(0, 3).map((row, i) => (
                                            <tr key={i}>
                                                <td className="py-2 text-white">{columnMapping.date !== -1 ? row[columnMapping.date] : '-'}</td>
                                                <td className="py-2 text-white">{columnMapping.description !== -1 ? row[columnMapping.description] : '-'}</td>
                                                <td className="py-2 text-white">{columnMapping.amount !== -1 ? row[columnMapping.amount] : '-'}</td>
                                                <td className="py-2 text-white">{columnMapping.type !== -1 ? row[columnMapping.type] : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" onClick={onClose} className="flex-1">
                                Cancelar
                            </Button>
                            <Button onClick={handleImport} disabled={loading} className="flex-1">
                                {loading ? 'Importando...' : 'Importar Transações'}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};
