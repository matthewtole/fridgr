import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const colorOptions = [
  'lemon',
  'peach',
  'rose',
  'orchid',
  'mauve',
  'sky',
  'frost',
  'aqua',
  'aquamarine',
  'mint',
] as const

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'light', 'ghost'],
    },
    color: {
      control: 'select',
      options: [...colorOptions],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const SolidSky: Story = {
  args: {
    variant: 'solid',
    color: 'sky',
    children: 'Button',
  },
}

export const SolidMauve: Story = {
  args: {
    variant: 'solid',
    color: 'mauve',
    children: 'Button',
  },
}

export const SolidRose: Story = {
  args: {
    variant: 'solid',
    color: 'rose',
    children: 'Button',
  },
}

export const SolidMint: Story = {
  args: {
    variant: 'solid',
    color: 'mint',
    children: 'Button',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    color: 'sky',
    children: 'Button',
  },
}

export const Light: Story = {
  args: {
    variant: 'light',
    color: 'sky',
    children: 'Button',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    color: 'rose',
    children: '×',
  },
}

export const Small: Story = {
  args: {
    variant: 'solid',
    color: 'sky',
    size: 'small',
    children: 'Small Button',
  },
}

export const Medium: Story = {
  args: {
    variant: 'solid',
    color: 'sky',
    size: 'medium',
    children: 'Medium Button',
  },
}

export const Large: Story = {
  args: {
    variant: 'solid',
    color: 'sky',
    size: 'large',
    children: 'Large Button',
  },
}

export const Loading: Story = {
  args: {
    variant: 'solid',
    color: 'sky',
    loading: true,
    children: 'Loading...',
  },
}

export const Disabled: Story = {
  args: {
    variant: 'solid',
    color: 'sky',
    disabled: true,
    children: 'Disabled',
  },
}
