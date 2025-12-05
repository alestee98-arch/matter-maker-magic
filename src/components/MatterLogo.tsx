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
      {/* Sprout Icon - matching the user's design */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Left leaf */}
        <path
          d="M16 20C16 20 8 18 4 8C4 8 14 6 16 20Z"
          fill="currentColor"
        />
        {/* Right leaf */}
        <path
          d="M16 14C16 14 22 10 28 2C28 2 30 14 16 14Z"
          fill="currentColor"
        />
        {/* Stem */}
        <path
          d="M16 14V28"
          stroke="currentColor"
          strokeWidth="2.5"
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