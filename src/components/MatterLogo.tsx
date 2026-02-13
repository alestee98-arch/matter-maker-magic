import React from 'react';

interface MatterLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function MatterLogo({ className = '', showText = true, size = 'md' }: MatterLogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 28, text: 'text-xl' },
    lg: { icon: 40, text: 'text-2xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Left leaf */}
        <path
          d="M30 32C28 26 24 20 16 14C14 12.5 12 12 10 12C10 12 10 16 12 20C14 24 20 30 30 32Z"
          fill="currentColor"
        />
        {/* Right leaf */}
        <path
          d="M34 26C36 20 40 14 48 8C50 6.5 52 6 54 6C54 6 54 10 52 14C50 18 44 24 34 26Z"
          fill="currentColor"
        />
        {/* Stem */}
        <path
          d="M32 28C32 28 32 40 32 56"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      
      {showText && (
        <span className={`font-semibold ${text} tracking-tight`}>
          Matter
        </span>
      )}
    </div>
  );
}