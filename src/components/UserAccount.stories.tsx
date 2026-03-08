import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserAccount } from './UserAccount';
import { User } from '../models/User';

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
    user: new User('guest-123', true),
  },
};

export const Permanent: Story = {
  args: {
    user: new User('permanent-456', false, 'Jane Doe'),
  },
};
