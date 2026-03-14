import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserAccount } from './UserAccount';
import { AnonymousUser, RegisteredUser } from '../models/User';
import { ServiceProvider } from '../services/ServiceProvider';
import { InMemoryAuthService } from '../services/auth/InMemoryAuthService';
import { InMemoryFirestoreService } from '../services/firestore/InMemoryFirestoreService';

const authService = new InMemoryAuthService();
const firestoreService = new InMemoryFirestoreService();

const meta = {
  title: 'UI/Components/UserAccount',
  component: UserAccount,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ServiceProvider authService={authService} firestoreService={firestoreService}>
        <Story />
      </ServiceProvider>
    ),
  ],
} satisfies Meta<typeof UserAccount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Guest: Story = {
  args: {
    user: new AnonymousUser('guest-123'),
  },
};

export const Permanent: Story = {
  args: {
    user: new RegisteredUser('permanent-456', 'Jane Doe'),
  },
};
