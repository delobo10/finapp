import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-surface/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl ${className}`}>
            {children}
        </div>
    );
};
