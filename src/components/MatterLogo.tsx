import React from 'react';
import sproutIcon from '@/assets/matter-sprout.png';

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
      <img 
        src={sproutIcon} 
        alt="Matter" 
        width={icon} 
        height={icon}
        className="flex-shrink-0"
      />
      {showText && (
        <span className={`font-bold ${text} text-foreground tracking-tight`}>
          Matter
        </span>
      )}
    </div>
  );
}