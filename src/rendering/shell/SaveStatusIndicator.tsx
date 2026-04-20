import React from 'react';
import './SaveStatusIndicator.css';

export type SaveStatus = 'idle' | 'saved' | 'error';

export interface SaveStatusIndicatorProps {
  status: SaveStatus;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ status }) => {
  if (status === 'idle') return null;

  return (
    <div className={`save-status save-status--${status}`} data-testid="save-status">
      {status === 'saved' && 'Saved'}
      {status === 'error' && 'Save Failed (Offline?)'}
    </div>
  );
};
