import type { Meta, StoryObj } from '@storybook/react-vite'
import { Example } from './Example'

const meta = {
  title: 'Example/Example',
  component: Example,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Example>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
