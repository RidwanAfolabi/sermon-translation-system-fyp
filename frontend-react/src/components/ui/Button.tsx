import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  icon,
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-[#111827] text-white hover:bg-[#0f172a] active:scale-[0.99] shadow-sm hover:shadow-md',
    secondary: 'border border-[#1f6f6d] text-[#1f6f6d] hover:bg-[#1f6f6d] hover:text-white',
    danger: 'bg-[#b42318] text-white hover:bg-[#981b10] active:scale-[0.99]',
    ghost: 'text-[#1f6f6d] hover:bg-[#1f6f6d]/10',
    success: 'bg-[#c5a24a] text-[#101827] hover:bg-[#b89139] active:scale-[0.99]',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
