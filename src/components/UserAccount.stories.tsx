import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserAccount } from './UserAccount';
import { AnonymousUser, RegisteredUser } from '../models/User';

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
    user: new RegisteredUser({ id: 'permanent-456', displayName: 'Jane Doe' }),
  },
};
