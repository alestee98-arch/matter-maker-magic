import React from 'react';
import matterSprout from '@/assets/matter-sprout.png';

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
      <img
        src={matterSprout}
        alt="Matter"
        width={icon}
        height={icon}
        className="flex-shrink-0"
      />
      
      {showText && (
        <span className={`font-semibold ${text} tracking-tight`}>
          Matter
        </span>
      )}
    </div>
  );
}