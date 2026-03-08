import React from 'react';
import { User } from '../models/User';
import { RegisteredUser } from '../models/User';
import { AuthService } from '../services/AuthService';
import './UserAccount.css';

interface UserAccountProps {
  user: User;
}

export const UserAccount: React.FC<UserAccountProps> = ({ user }) => {
  const handleLinkGoogle = async () => {
    try {
      await AuthService.signInWithGoogle();
      // SessionContext will automatically update via onAuthStateChanged
    } catch (error) {
      console.error("Failed to link Google account", error);
      alert("Failed to sign in with Google. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  return (
    <div className="user-account">
      <div className="user-account__info">
        <div className="user-account__status">
          {user.isAnonymous ? (
            <span className="user-account__badge user-account__badge--anonymous">Guest Session</span>
          ) : (
            <span className="user-account__badge user-account__badge--permanent">Permanent Account</span>
          )}
        </div>
        <div className="user-account__details">
          <p className="user-account__label">User ID:</p>
          <p className="user-account__value">{user.id}</p>
          {!user.isAnonymous && (
            <>
              <p className="user-account__label">Name:</p>
              <p className="user-account__value">{(user as RegisteredUser).displayName}</p>
            </>
          )}
        </div>
      </div>

      <div className="user-account__actions">
        {user.isAnonymous ? (
          <button 
            className="user-account__button user-account__button--google"
            onClick={handleLinkGoogle}
          >
            Link Google Account
          </button>
        ) : (
          <button 
            className="user-account__button user-account__button--secondary"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        )}
      </div>
      
      {user.isAnonymous && (
        <p className="user-account__note">
          Link your account to save your progress permanently and play on other devices.
        </p>
      )}
    </div>
  );
};
