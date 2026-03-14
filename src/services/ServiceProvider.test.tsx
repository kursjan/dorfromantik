// src/services/ServiceProvider.test.tsx
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ServiceProvider } from './ServiceProvider';
import { useAuthService, useFirestoreService } from './hooks/useServices';
import { InMemoryAuthService } from './auth/InMemoryAuthService';
import { InMemoryFirestoreService } from './firestore/InMemoryFirestoreService';

// Test component that uses the hooks
function TestComponent() {
  const authService = useAuthService();
  const firestoreService = useFirestoreService();
  
  return (
    <div>
      <span data-testid="auth-service">
        {authService.constructor.name}
      </span>
      <span data-testid="firestore-service">
        {firestoreService.constructor.name}
      </span>
    </div>
  );
}

describe('ServiceProvider', () => {
  beforeEach(() => {
    // Save original env
    const originalEnv = { ...import.meta.env };
    
    // Clean up after each test
    afterEach(() => {
      // Restore original env
      Object.assign(import.meta.env, originalEnv);
    });
  });

  it('provides auth and firestore services', () => {
    render(
      <ServiceProvider>
        <TestComponent />
      </ServiceProvider>
    );

    expect(screen.getByTestId('auth-service')).toBeInTheDocument();
    expect(screen.getByTestId('firestore-service')).toBeInTheDocument();
  });

  it('throws error when hooks are used outside ServiceProvider', () => {
    // Suppress console errors for this test
    const originalError = console.error;
    console.error = () => {};
    
    try {
      expect(() => {
        // This should throw because there's no ServiceProvider
        const TestComponentWithoutProvider = () => {
          useAuthService();
          return <div>Test</div>;
        };
        render(<TestComponentWithoutProvider />);
      }).toThrow('useAuthService must be used within a ServiceProvider');
    } finally {
      console.error = originalError;
    }
  });

  it('uses InMemory services when VITE_USE_MOCK_AUTH is true', () => {
    // Set mock auth flag
    import.meta.env.VITE_USE_MOCK_AUTH = 'true';
    
    render(
      <ServiceProvider>
        <TestComponent />
      </ServiceProvider>
    );

    expect(screen.getByTestId('auth-service').textContent).toContain('InMemory');
    expect(screen.getByTestId('firestore-service').textContent).toContain('InMemory');
  });

  it('uses Firebase services when VITE_USE_MOCK_AUTH is not true', () => {
    // Ensure mock auth is not set
    delete import.meta.env.VITE_USE_MOCK_AUTH;
    
    render(
      <ServiceProvider>
        <TestComponent />
      </ServiceProvider>
    );

    expect(screen.getByTestId('auth-service').textContent).toContain('Firebase');
    expect(screen.getByTestId('firestore-service').textContent).toContain('Firebase');
  });

  it('uses injected authService and firestoreService when provided', () => {
    const authService = new InMemoryAuthService();
    const firestoreService = new InMemoryFirestoreService();

    render(
      <ServiceProvider authService={authService} firestoreService={firestoreService}>
        <TestComponent />
      </ServiceProvider>
    );

    expect(screen.getByTestId('auth-service')).toHaveTextContent('InMemoryAuthService');
    expect(screen.getByTestId('firestore-service')).toHaveTextContent('InMemoryFirestoreService');
  });
});
