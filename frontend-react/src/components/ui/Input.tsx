import { InputHTMLAttributes, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = props.value || props.defaultValue;

  return (
    <div className="w-full">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c757d]">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`
            w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-[#dc3545] focus:border-[#dc3545]' : 'border-[#e0e0e0] focus:border-[#0d7377]'}
            focus:outline-none focus:shadow-[0_0_0_3px_rgba(13,115,119,0.1)]
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${className}
          `}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
        {label && (
          <label
            className={`
              absolute left-4 transition-all duration-200 pointer-events-none
              ${icon ? 'left-10' : 'left-4'}
              ${isFocused || hasValue 
                ? '-top-2.5 text-xs bg-white px-1 text-[#0d7377]' 
                : 'top-1/2 -translate-y-1/2 text-[#6c757d]'}
            `}
          >
            {label}
          </label>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-[#dc3545]">{error}</p>}
    </div>
  );
}
