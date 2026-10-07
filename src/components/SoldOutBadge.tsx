import React from 'react';

interface SoldOutBadgeProps {
  className?: string;
}

export function SoldOutBadge({ className = '' }: SoldOutBadgeProps) {
  return (
    <span
      className={`bg-ink text-white text-[8px] uppercase tracking-[0.2em] px-2 py-1 ${className}`}
      aria-label="Sold out">
      Sold out
    </span>
  );
}
