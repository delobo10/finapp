import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-text-muted mb-1.5">
                    {label}
                </label>
            )}
            <input
                className={`w-full bg-background border border-slate-700 rounded-lg px-4 py-2.5 text-text placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-danger">{error}</p>}
        </div>
    );
};
