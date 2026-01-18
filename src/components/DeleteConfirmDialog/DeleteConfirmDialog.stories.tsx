import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

const meta = {
  title: 'Components/DeleteConfirmDialog',
  component: DeleteConfirmDialog,
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
        },
      });
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DeleteConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    itemName: 'Milk',
    itemId: 1,
    onClose: () => console.log('Closed'),
  },
};

export const WithLongItemName: Story = {
  args: {
    isOpen: true,
    itemName: 'Organic Free-Range Chicken Breast',
    itemId: 2,
    onClose: () => console.log('Closed'),
  },
};
