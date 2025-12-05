import React from 'react';

interface MatterLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function MatterLogo({ className = '', showText = true, size = 'md' }: MatterLogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 48, text: 'text-3xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Sprout/Leaf Icon */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Stem */}
        <path
          d="M24 44C24 44 24 28 24 24"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Left leaf */}
        <path
          d="M24 24C24 24 12 22 8 12C8 12 20 8 24 24Z"
          fill="currentColor"
        />
        {/* Right leaf */}
        <path
          d="M24 18C24 18 32 14 38 4C38 4 44 16 24 18Z"
          fill="currentColor"
        />
      </svg>
      
      {showText && (
        <span className={`font-bold ${text} text-foreground tracking-tight`} style={{ fontFamily: 'var(--font-sans)' }}>
          Matter
        </span>
      )}
    </div>
  );
}