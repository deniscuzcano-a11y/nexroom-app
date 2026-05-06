import React from 'react';

interface ImagePlaceholderProps {
  type: 'minimal' | 'modern' | 'cozy' | 'hero' | 'scandinavian' | 'japandi' | 'luxury' | 'bedroom' | 'livingroom' | 'office';
  className?: string;
  showIcon?: boolean;
}

export function ImagePlaceholder({ type, className = '', showIcon = true }: ImagePlaceholderProps) {
  const styleConfigs: Record<string, { gradient: string; icon: string; color: string }> = {
    minimal: { gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', icon: '▢', color: '#64748b' },
    modern: { gradient: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)', icon: '◈', color: '#0f172a' },
    cozy: { gradient: 'linear-gradient(135deg, #fef7ed 0%, #fdba74 100%)', icon: '◉', color: '#9a3412' },
    hero: { gradient: 'linear-gradient(135deg, #f3e8ff 0%, #d8b4fe 100%)', icon: '✦', color: '#7c3aed' },
    scandinavian: { gradient: 'linear-gradient(135deg, #fefefe 0%, #f1f5f9 100%)', icon: '□', color: '#475569' },
    japandi: { gradient: 'linear-gradient(135deg, #f7f7f7 0%, #d1d5db 100%)', icon: '◯', color: '#374151' },
    luxury: { gradient: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)', icon: '◆', color: '#fbbf24' },
    bedroom: { gradient: 'linear-gradient(135deg, #fdf2f8 0%, #fbcfe8 100%)', icon: '🛏️', color: '#be185d' },
    livingroom: { gradient: 'linear-gradient(135deg, #f0f9ff 0%, #bae6fd 100%)', icon: ' Couch ', color: '#0369a1' },
    office: { gradient: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)', icon: '💼', color: '#1e40af' }
  };

  const config = styleConfigs[type] || styleConfigs.minimal;

  return (
    <div className={`w-full h-full flex items-center justify-center rounded-xl ${className}`} style={{ background: config.gradient, minHeight: '150px', position: 'relative' }}>
      {showIcon && (
        <span style={{ fontSize: '3rem', opacity: 0.5, color: config.color }}>{config.icon}</span>
      )}
    </div>
  );
}