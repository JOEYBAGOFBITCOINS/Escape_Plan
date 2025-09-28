import React, { ReactNode } from 'react';

interface GlassmorphicButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
  size?: 'default' | 'medium' | 'large';
}

export const GlassmorphicButton: React.FC<GlassmorphicButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  size = 'default'
}) => {
  const sizeStyles = {
    default: 'px-6 py-3.5 h-12',
    medium: 'px-5 py-3 h-12',
    large: 'px-8 py-4 h-16'
  };

  return (
    <div className={`relative glassmorphic-btn ${className}`}>
      {/* Shadow */}
      <div 
        className="absolute inset-0 rounded-full blur-sm opacity-40 pointer-events-none transition-all duration-300"
        style={{
          background: 'linear-gradient(180deg, rgba(37,99,235,0.4), rgba(37,99,235,0.2))',
          transform: 'translateY(3px)',
          width: 'calc(100% - 8px)',
          height: 'calc(100% - 8px)',
          top: '2px',
          left: '4px',
        }}
      />
      
      {/* Button */}
      <button
        type="button"
        className={`
          relative z-10 w-full ${sizeStyles[size]}
          cursor-pointer select-none rounded-full
          transition-all duration-300 ease-out
          backdrop-blur-sm border-0 outline-none focus:outline-none
          active:scale-95 hover:scale-[0.975]
          ${variant === 'primary' 
            ? 'bg-gradient-to-br from-blue-500/20 via-blue-400/30 to-blue-600/15' 
            : 'bg-gradient-to-br from-blue-500/10 via-blue-400/20 to-blue-600/8'
          }
        `}
        onClick={onClick}
        style={{
          boxShadow: variant === 'primary' 
            ? 'inset 0 2px 2px rgba(0,0,0,0.05), inset 0 -2px 2px rgba(96,165,250,0.6), 0 4px 2px -2px rgba(0,0,0,0.2), 0 0 0 4px inset rgba(96,165,250,0.3)'
            : 'inset 0 2px 2px rgba(0,0,0,0.05), inset 0 -2px 2px rgba(96,165,250,0.4), 0 4px 2px -2px rgba(0,0,0,0.15), 0 0 0 2px inset rgba(96,165,250,0.2)'
        }}
      >
        {/* Border gradient */}
        <div 
          className="border-gradient absolute inset-0 rounded-full pointer-events-none transition-all duration-300"
          style={{
            background: `
              conic-gradient(
                from -75deg at 50% 50%,
                rgba(59,130,246,0.6),
                rgba(59,130,246,0) 5% 40%,
                rgba(59,130,246,0.6) 50%,
                rgba(59,130,246,0) 60% 95%,
                rgba(59,130,246,0.6)
              ),
              linear-gradient(180deg, rgba(96,165,250,0.5), rgba(96,165,250,0.5))
            `,
            padding: '1px',
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            maskComposite: 'exclude',
          }}
        />
        
        {/* Shine effect */}
        <div 
          className="shine-effect absolute inset-0 rounded-full pointer-events-none opacity-60 mix-blend-screen transition-all duration-500"
          style={{
            background: `
              linear-gradient(
                -45deg,
                rgba(96,165,250,0) 0%,
                rgba(147,197,253,0.8) 40% 50%,
                rgba(96,165,250,0) 55%
              )
            `,
            backgroundSize: '200% 200%',
            backgroundPosition: '0% 50%',
          }}
        />
        
        {/* Content */}
        <span className="relative z-20 flex items-center justify-center text-white/95 font-medium text-shadow-sm">
          {children}
        </span>
      </button>
    </div>
  );
};