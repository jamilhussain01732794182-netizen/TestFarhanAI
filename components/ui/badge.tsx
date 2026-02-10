import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', className, children }) => {
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  let variantStyles = "border-transparent bg-blue-600 text-white hover:bg-blue-700";
  if (variant === 'secondary') variantStyles = "border-transparent bg-gray-600 text-white hover:bg-gray-700";
  if (variant === 'destructive') variantStyles = "border-transparent bg-red-600 text-white hover:bg-red-700";
  if (variant === 'outline') variantStyles = "text-foreground border-gray-600";

  // Override for specific background classes passed in className
  if (className?.includes('bg-')) {
     variantStyles = "border-transparent text-white";
  }

  return (
    <div className={`${baseStyles} ${variantStyles} ${className || ''}`}>
      {children}
    </div>
  );
};