import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserAccount } from './UserAccount';
import { User } from '../models/User';
import { AuthService } from '../services/AuthService';

vi.mock('../services/AuthService', () => ({
  AuthService: {
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  },
}));

describe('UserAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders guest status for anonymous users', () => {
    const user = new User('guest-123', true);
    render(<UserAccount user={user} />);

    expect(screen.getByText(/Guest Session/i)).toBeInTheDocument();
    expect(screen.getByText(/Link Google Account/i)).toBeInTheDocument();
    expect(screen.getByText(/guest-123/i)).toBeInTheDocument();
  });

  it('renders permanent status for signed-in users', () => {
    const user = new User('permanent-123', false, 'John Doe');
    render(<UserAccount user={user} />);

    expect(screen.getByText(/Permanent Account/i)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Out/i)).toBeInTheDocument();
  });

  it('calls signInWithGoogle when Link button is clicked', () => {
    const user = new User('guest-123', true);
    render(<UserAccount user={user} />);

    fireEvent.click(screen.getByText(/Link Google Account/i));
    expect(AuthService.signInWithGoogle).toHaveBeenCalled();
  });

  it('calls signOut when Sign Out button is clicked', () => {
    const user = new User('permanent-123', false);
    render(<UserAccount user={user} />);

    fireEvent.click(screen.getByText(/Sign Out/i));
    expect(AuthService.signOut).toHaveBeenCalled();
  });
});
