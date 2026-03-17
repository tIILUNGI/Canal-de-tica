import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full bg-slate-50 border-2 border-transparent rounded-xl
            focus:border-primary focus:bg-white outline-none transition-all
            font-medium text-slate-700 placeholder:text-slate-400
            ${icon ? 'pl-12' : 'p-4'}
            ${error ? 'border-rose-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full bg-slate-50 border-2 border-transparent rounded-2xl
          focus:border-primary focus:bg-white outline-none transition-all
          font-medium text-slate-600 placeholder:text-slate-400 resize-none
          ${error ? 'border-rose-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Input;
