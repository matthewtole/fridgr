import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { InventoryTable } from './InventoryTable'
import type { InventoryItemWithRelations } from '../../lib/queries/inventory'

const meta = {
  title: 'Components/InventoryTable',
  component: InventoryTable,
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
} satisfies Meta<typeof InventoryTable>

export default meta
type Story = StoryObj<typeof meta>

const mockItems: InventoryItemWithRelations[] = [
  {
    id: 1,
    product_id: null,
    quantity: 3,
    quantity_type: 'units',
    location_id: 1,
    added_date: '2024-01-15',
    expiration_date: '2024-01-22',
    opened_status: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    products: {
      name: 'Milk',
      category: 'dairy',
    },
    locations: {
      name: 'fridge',
      display_order: 2,
    },
  },
  {
    id: 2,
    product_id: null,
    quantity: 2.5,
    quantity_type: 'volume',
    location_id: 2,
    added_date: '2024-01-10',
    expiration_date: '2024-01-17',
    opened_status: true,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
    products: {
      name: 'Orange Juice',
      category: 'beverages',
    },
    locations: {
      name: 'fridge',
      display_order: 2,
    },
  },
  {
    id: 3,
    product_id: null,
    quantity: 500,
    quantity_type: 'weight',
    location_id: 3,
    added_date: '2024-01-05',
    expiration_date: null,
    opened_status: false,
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z',
    products: null,
    locations: {
      name: 'freezer',
      display_order: 3,
    },
  },
]

export const Default: Story = {
  args: {
    data: mockItems,
    onEdit: (id) => console.log('Edit', id),
    onDelete: (id) => console.log('Delete', id),
    isLoading: false,
  },
}

export const Loading: Story = {
  args: {
    data: [],
    onEdit: (id) => console.log('Edit', id),
    onDelete: (id) => console.log('Delete', id),
    isLoading: true,
  },
}

export const Empty: Story = {
  args: {
    data: [],
    onEdit: (id) => console.log('Edit', id),
    onDelete: (id) => console.log('Delete', id),
    isLoading: false,
  },
}

export const ManyItems: Story = {
  args: {
    data: Array.from({ length: 20 }, (_, i) => ({
      ...mockItems[0],
      id: i + 1,
      products: {
        name: `Item ${i + 1}`,
        category: 'food',
      },
    })),
    onEdit: (id) => console.log('Edit', id),
    onDelete: (id) => console.log('Delete', id),
    isLoading: false,
  },
}

export const ExpiringSoon: Story = {
  args: {
    data: [
      {
        ...mockItems[0],
        expiration_date: new Date().toISOString().split('T')[0], // Today
      },
      {
        ...mockItems[1],
        expiration_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // 2 days from now
      },
      {
        ...mockItems[2],
        expiration_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // Yesterday (expired)
      },
    ],
    onEdit: (id) => console.log('Edit', id),
    onDelete: (id) => console.log('Delete', id),
    isLoading: false,
  },
}
