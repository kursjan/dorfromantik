import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/react-vite';
import * as projectAnnotations from './preview';
import { vi } from 'vitest';

// Mock Firebase services globally for Storybook tests
vi.mock('../src/services/firebase', () => ({
  auth: {
    currentUser: { uid: 'mock-uid', isAnonymous: true }
  },
  db: {},
  app: {}
}));

vi.mock('../src/services/AuthService', () => {
  const mockUser = { uid: 'mock-uid', isAnonymous: true, displayName: null };
  return {
    AuthService: {
      signInAnonymously: vi.fn().mockResolvedValue(mockUser),
      signInWithGoogle: vi.fn().mockResolvedValue(mockUser),
      signOut: vi.fn().mockResolvedValue(undefined),
      onAuthStateChanged: vi.fn((callback) => {
        // Immediately invoke with a mock user
        callback(mockUser);
        return vi.fn(); // Mock unsubscribe function
      }),
      getCurrentUser: vi.fn().mockReturnValue(mockUser),
    }
  };
});

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);

