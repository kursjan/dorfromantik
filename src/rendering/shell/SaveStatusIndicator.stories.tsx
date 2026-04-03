import type { Meta, StoryObj } from '@storybook/react-vite';
import { SaveStatusIndicator } from './SaveStatusIndicator';

const meta = {
  title: 'UI/Components/SaveStatusIndicator',
  component: SaveStatusIndicator,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: '300px', height: '200px', background: '#333' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SaveStatusIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Saved: Story = {
  args: {
    status: 'saved',
  },
};

export const Error: Story = {
  args: {
    status: 'error',
  },
};

export const Idle: Story = {
  args: {
    status: 'idle',
  },
};
