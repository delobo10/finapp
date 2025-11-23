import React from 'react';
import { LayoutDashboard, ArrowRightLeft, LogOut, Wallet, Target, FileText, RefreshCw, BookOpen, PiggyBank, TrendingUp, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { NotificationDropdown } from './NotificationDropdown';

interface LayoutProps {
    children: React.ReactNode;
}

import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const isActive = (path: string) => location.pathname === path;

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/transactions', icon: ArrowRightLeft, label: 'Transações' },
        { path: '/trends', icon: TrendingUp, label: 'Tendências' },
        { path: '/recurring', icon: RefreshCw, label: 'Recorrências' },
        { path: '/goals', icon: Target, label: 'Metas' },
        { path: '/orcamentos', icon: PiggyBank, label: 'Orçamentos' },
        { path: '/reports', icon: FileText, label: 'Relatórios' },
        { path: '/educacao', icon: BookOpen, label: 'Educação Financeira' },
        { path: '/settings', icon: Settings, label: 'Configurações' },
    ];

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="w-64 bg-surface border-r border-slate-800 fixed h-full hidden md:flex flex-col z-50">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                        <Wallet className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-tight">FinApp</h1>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item.path)
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'text-text-muted hover:bg-slate-800 hover:text-text'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-text-muted hover:bg-slate-800 hover:text-danger transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sair</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-surface border-b border-slate-800 p-4 z-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <Wallet className="text-white w-5 h-5" />
                    </div>
                    <h1 className="text-lg font-bold text-white">FinApp</h1>
                </div>
                <NotificationDropdown />
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
                {/* Desktop Header */}
                <header className="hidden md:flex items-center justify-end px-8 py-4 bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b border-slate-800/50">
                    <div className="flex items-center gap-4">
                        <NotificationDropdown />
                    </div>
                </header>

                <div className="p-6 md:p-8 pt-20 md:pt-8 flex-1">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};
