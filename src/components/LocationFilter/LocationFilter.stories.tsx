import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LocationFilter } from './LocationFilter'

const meta = {
  title: 'Components/LocationFilter',
  component: LocationFilter,
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
        },
      })
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      )
    },
  ],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LocationFilter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: undefined,
    onChange: (id) => console.log('Selected location:', id),
  },
}

export const WithSelectedLocation: Story = {
  args: {
    value: 1,
    onChange: (id) => console.log('Selected location:', id),
  },
}
