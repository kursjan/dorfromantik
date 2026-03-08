import React from 'react';
import { useSession } from '../context/SessionContext';
import { UserAccount } from './UserAccount';
import './SettingsModal.css';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { session } = useSession();
  
  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal__header">
          <h2 className="settings-modal__title">Settings</h2>
        </div>
        
        <div className="settings-modal__content">
          <div className="settings-modal__section">
            <span className="settings-modal__section-title">Profile & Account</span>
            <UserAccount user={session.user} />
          </div>

          <div className="settings-modal__section">
            <span className="settings-modal__section-title">Audio</span>
            <div className="settings-placeholder">Volume controls coming soon...</div>
          </div>

          <div className="settings-modal__section">
            <span className="settings-modal__section-title">Graphics</span>
            <div className="settings-placeholder">Resolution and quality settings coming soon...</div>
          </div>
        </div>

        <div className="settings-modal__footer">
          <button className="settings-modal__close-btn" onClick={onClose}>
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
