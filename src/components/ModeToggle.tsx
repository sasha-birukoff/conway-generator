import React from 'react';

export type AppMode = 'static' | 'animated';

interface ModeToggleProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onModeChange }) => {
  return (
    <div className="mode-toggle">
      <button
        className={`mode-toggle-option ${mode === 'static' ? 'active' : ''}`}
        onClick={() => onModeChange('static')}
      >
        Static
      </button>
      <button
        className={`mode-toggle-option ${mode === 'animated' ? 'active' : ''}`}
        onClick={() => onModeChange('animated')}
      >
        Animated
      </button>
      <div
        className="mode-toggle-indicator"
        style={{ transform: mode === 'animated' ? 'translateX(100%)' : 'translateX(0)' }}
      />
    </div>
  );
};
