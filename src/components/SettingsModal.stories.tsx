import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingsModal } from './SettingsModal';
import { UserContext, GameHistoryContext, ActiveGameContext } from '../context/SessionContext';
import { AnonymousUser, RegisteredUser } from '../models/User';
import { Game } from '../models/Game';
import { Board } from '../models/Board';
import { GameRules } from '../models/GameRules';
import { ServiceProvider } from '../services/ServiceProvider';
import { InMemoryAuthService } from '../services/auth/InMemoryAuthService';
import { InMemoryFirestoreService } from '../services/firestore/InMemoryFirestoreService';

const storyAuthService = new InMemoryAuthService();
const storyFirestoreService = new InMemoryFirestoreService();

const mockUser = new AnonymousUser('mock-user-123');
const mockGames = [
  new Game({
    id: '1',
    name: 'Saved Adventure',
    score: 1500,
    board: new Board(),
    rules: GameRules.createStandard(),
  }),
];

const meta = {
  title: 'MainMenu/SettingsModal',
  component: SettingsModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ServiceProvider authService={storyAuthService} firestoreService={storyFirestoreService}>
        <UserContext.Provider value={{ user: mockUser }}>
          <GameHistoryContext.Provider value={{ games: mockGames }}>
            <ActiveGameContext.Provider
              value={{
                activeGame: null,
                setActiveGame: () => {},
              }}
            >
              <Story />
            </ActiveGameContext.Provider>
          </GameHistoryContext.Provider>
        </UserContext.Provider>
      </ServiceProvider>
    ),
  ],
  argTypes: {
    onClose: { action: 'closed' },
  },
} satisfies Meta<typeof SettingsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Anonymous: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close clicked'),
  },
};

export const PermanentAccount: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close clicked'),
  },
  decorators: [
    (Story) => {
      const permanentUser = new RegisteredUser('permanent-user-456', 'Jane Doe');
      return (
        <ServiceProvider authService={storyAuthService} firestoreService={storyFirestoreService}>
          <UserContext.Provider value={{ user: permanentUser }}>
            <GameHistoryContext.Provider value={{ games: [] }}>
              <ActiveGameContext.Provider
                value={{
                  activeGame: null,
                  setActiveGame: () => {},
                }}
              >
                <Story />
              </ActiveGameContext.Provider>
            </GameHistoryContext.Provider>
          </UserContext.Provider>
        </ServiceProvider>
      );
    },
  ],
};
