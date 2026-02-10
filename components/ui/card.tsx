import React from 'react';

export function Card({ className, children }: { className?: string, children?: React.ReactNode }) {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ''}`}>
      {children}
    </div>
  );
}

export function CardContent({ className, children }: { className?: string, children?: React.ReactNode }) {
  return (
    <div className={`p-6 pt-0 ${className || ''}`}>
      {children}
    </div>
  );
}