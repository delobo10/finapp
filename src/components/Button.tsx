import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
    className,
    variant = 'primary',
    size = 'md',
    ...props
}) => {
    const variants = {
        primary: 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25',
        secondary: 'bg-surface hover:bg-slate-700 text-text border border-slate-700',
        danger: 'bg-danger hover:bg-red-600 text-white shadow-lg shadow-danger/25',
        ghost: 'hover:bg-slate-800 text-text-muted hover:text-text',
        outline: 'border-2 border-slate-700 text-text hover:border-primary hover:text-primary bg-transparent',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            className={cn(
                'rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
};
