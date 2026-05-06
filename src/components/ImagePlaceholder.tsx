import React from 'react';

interface ImagePlaceholderProps {
  type: 'minimal' | 'modern' | 'cozy' | 'hero' | 'scandinavian' | 'japandi' | 'luxury' | 'bedroom' | 'livingroom' | 'office';
  className?: string;
  showIcon?: boolean;
}

export function ImagePlaceholder({ type, className = '', showIcon = true }: ImagePlaceholderProps) {
  const styleConfigs: Record<string, { gradient: string; icon: string; color: string }> = {
    minimal: {
      gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      icon: '▢',
      color: '#64748b'
    },
    modern: {
      gradient: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 50%, #e2e8f0 100%)',
      icon: '◈',
      color: '#0f172a'
    },
    cozy: {
      gradient: 'linear-gradient(135deg, #fef7ed 0%, #fed7aa 50%, #fdba74 100%)',
      icon: '◉',
      color: '#9a3412'
    },
    hero: {
      gradient: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 50%, #d8b4fe 100%)',
      icon: '✦',
      color: '#7c3aed'
    },
    scandinavian: {
      gradient: 'linear-gradient(135deg, #fefefe 0%, #f8fafc 50%, #f1f5f9 100%)',
      icon: '□',
      color: '#475569'
    },
    japandi: {
      gradient: 'linear-gradient(135deg, #f7f7f7 0%, #e5e7eb 50%, #d1d5db 100%)',
      icon: '◯',
      color: '#374151'
    },
    luxury: {
      gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
      icon: '◆',
      color: '#fbbf24'
    },
    bedroom: {
      gradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
      icon: '🛏️',
      color: '#be185d'
    },
    livingroom: {
      gradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
      icon: '🛋️',
      color: '#0369a1'
    },
    office: {
      gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      icon: '💼',
      color: '#1e40af'
    }
  };

  const config = styleConfigs[type] || styleConfigs.minimal;

  return (
    <div
      className={`nr-imagePlaceholder ${className}`}
      style={{
        backgroundImage: config.gradient,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        minHeight: '200px',
        borderRadius: '1rem'
      }}
      role="img"
      aria-label={`${type} room interior design preview`}
    >
      {showIcon && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '3rem',
            opacity: 0.6,
            color: config.color,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
          }}
          aria-hidden="true"
        >
          {config.icon}
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(0,0,0,0.05) 0%, transparent 50%)`,
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />
    </div>
  );
}