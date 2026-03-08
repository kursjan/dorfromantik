import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingsModal } from './SettingsModal';
import { SessionContext } from '../context/SessionContext';
import { Session } from '../models/Session';
import { User } from '../models/User';
import { Game } from '../models/Game';
import { Board } from '../models/Board';
import { GameRules } from '../models/GameRules';

const mockUser = new User('mock-user-123', true, 'Guest Player');
const mockSession = new Session('mock-session-123', mockUser);
mockSession.games.push(
  new Game({
    id: '1',
    name: 'Saved Adventure',
    score: 1500,
    board: new Board(),
    rules: GameRules.createStandard(),
  })
);

const meta = {
  title: 'MainMenu/SettingsModal',
  component: SettingsModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <SessionContext.Provider
        value={{
          session: mockSession,
          startNewStandardGame: () => {},
          startNewTestGame: () => {},
          continueGame: () => {},
        }}
      >
        <Story />
      </SessionContext.Provider>
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
      const permanentUser = new User('permanent-user-456', false, 'Jane Doe');
      const permanentSession = new Session('perm-session-456', permanentUser);
      return (
        <SessionContext.Provider
          value={{
            session: permanentSession,
            startNewStandardGame: () => {},
            startNewTestGame: () => {},
            continueGame: () => {},
          }}
        >
          <Story />
        </SessionContext.Provider>
      );
    },
  ],
};
