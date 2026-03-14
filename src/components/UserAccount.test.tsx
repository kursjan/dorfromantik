import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserAccount } from './UserAccount';
import { AnonymousUser, RegisteredUser } from '../models/User';
import { ServiceProvider } from '../services/ServiceProvider';
import { InMemoryAuthService } from '../services/auth/InMemoryAuthService';
import { InMemoryFirestoreService } from '../services/firestore/InMemoryFirestoreService';

describe('UserAccount', () => {
  const authService = new InMemoryAuthService();
  const firestoreService = new InMemoryFirestoreService();

  beforeEach(() => {
    authService._resetMockStore();
    firestoreService._resetMockStore();
  });

  function renderWithProvider(ui: React.ReactElement) {
    return render(
      <ServiceProvider authService={authService} firestoreService={firestoreService}>
        {ui}
      </ServiceProvider>
    );
  }

  it('renders guest status for anonymous users', () => {
    const user = new AnonymousUser('guest-123');
    renderWithProvider(<UserAccount user={user} />);

    expect(screen.getByText(/Guest Session/i)).toBeInTheDocument();
    expect(screen.getByText(/Link Google Account/i)).toBeInTheDocument();
    expect(screen.getByText(/guest-123/i)).toBeInTheDocument();
  });

  it('renders permanent status for signed-in users', () => {
    const user = new RegisteredUser('permanent-123', 'John Doe');
    renderWithProvider(<UserAccount user={user} />);

    expect(screen.getByText(/Permanent Account/i)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Out/i)).toBeInTheDocument();
  });

  it('calls signOut when Sign Out button is clicked', () => {
    const user = new RegisteredUser('permanent-123', 'Test Player');
    const signOutSpy = vi.spyOn(authService, 'signOut');
    renderWithProvider(<UserAccount user={user} />);

    fireEvent.click(screen.getByText(/Sign Out/i));
    expect(signOutSpy).toHaveBeenCalled();
  });

  it('calls signInWithGoogle when Link Google Account button is clicked', () => {
    const user = new AnonymousUser('guest-123');
    const signInWithGoogleSpy = vi.spyOn(authService, 'signInWithGoogle');
    renderWithProvider(<UserAccount user={user} />);

    fireEvent.click(screen.getByText(/Link Google Account/i));
    expect(signInWithGoogleSpy).toHaveBeenCalled();
  });
});
