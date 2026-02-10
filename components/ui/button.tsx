import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    let variantStyles = "bg-blue-600 text-white hover:bg-blue-700";
    if (variant === 'destructive') variantStyles = "bg-red-600 text-white hover:bg-red-700";
    if (variant === 'outline') variantStyles = "border border-input bg-background hover:bg-accent hover:text-accent-foreground";
    if (variant === 'secondary') variantStyles = "bg-secondary text-secondary-foreground hover:bg-secondary/80";
    if (variant === 'ghost') variantStyles = "hover:bg-accent hover:text-accent-foreground";
    if (variant === 'link') variantStyles = "text-primary underline-offset-4 hover:underline";

    let sizeStyles = "h-10 px-4 py-2";
    if (size === 'sm') sizeStyles = "h-9 rounded-md px-3";
    if (size === 'lg') sizeStyles = "h-11 rounded-md px-8";
    if (size === 'icon') sizeStyles = "h-10 w-10";

    const comp = asChild ? React.Fragment : 'button';

    if (asChild) {
      return (
        <span className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className || ''}`}>
          {props.children}
        </span>
      )
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className || ''}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";