import type { Meta, StoryObj } from '@storybook/react';
import { ResetViewButton } from './ResetViewButton';

const meta = {
  title: 'UI/Components/ResetViewButton',
  component: ResetViewButton,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof ResetViewButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onClick: () => console.log('Reset View clicked'),
  },
};

export const HoverState: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    pseudo: { hover: true },
  },
};
