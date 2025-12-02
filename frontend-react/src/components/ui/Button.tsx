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
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-[#0d7377] text-white hover:bg-[#0a5a5d] active:scale-[0.98] shadow-sm hover:shadow-md',
    secondary: 'border-2 border-[#0d7377] text-[#0d7377] hover:bg-[#0d7377] hover:text-white',
    danger: 'bg-[#dc3545] text-white hover:bg-[#c82333] active:scale-[0.98]',
    ghost: 'text-[#0d7377] hover:bg-[#0d7377]/10',
    success: 'bg-[#28a745] text-white hover:bg-[#218838] active:scale-[0.98]',
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
