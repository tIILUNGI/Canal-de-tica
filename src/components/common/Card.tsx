import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dark' | 'bordered' | 'shadow';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  onClick
}) => {
  const variantClasses = {
    default: 'bg-white',
    dark: 'bg-slate-900 text-white',
    bordered: 'bg-white border border-slate-200',
    shadow: 'bg-white shadow-lg shadow-slate-200/50'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const BaseComponent = onClick ? 'button' : 'div';

  return (
    <BaseComponent
      className={`
        rounded-2xl w-full
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform text-left' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </BaseComponent>
  );
};

export default Card;
