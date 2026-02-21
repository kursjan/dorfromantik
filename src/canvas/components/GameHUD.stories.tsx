import type { Meta, StoryObj } from '@storybook/react';
import { GameHUD } from './GameHUD';

const meta: Meta<typeof GameHUD> = {
  title: 'UI/Components/GameHUD',
  component: GameHUD,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GameHUD>;

export const Initial: Story = {
  args: {
    score: 0,
    remainingTurns: 30,
  },
};

export const InProgress: Story = {
  args: {
    score: 1450,
    remainingTurns: 12,
  },
};

export const EndGame: Story = {
  args: {
    score: 3200,
    remainingTurns: 0,
  },
};
