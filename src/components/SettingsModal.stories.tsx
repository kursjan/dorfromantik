import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingsModal } from './SettingsModal';

const meta = {
  title: 'MainMenu/SettingsModal',
  component: SettingsModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onClose: { action: 'closed' },
  },
} satisfies Meta<typeof SettingsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close clicked'),
  },
};
