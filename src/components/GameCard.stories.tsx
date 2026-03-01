import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameCard } from './GameCard';

const meta = {
  title: 'MainMenu/GameCard',
  component: GameCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSelect: { action: 'selected' },
  },
} satisfies Meta<typeof GameCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'game-1',
    name: 'Auto-Save',
    score: 1250,
    lastPlayed: '2026-02-27T10:00:00Z',
    onSelect: (id) => console.log('Selected:', id),
  },
};
