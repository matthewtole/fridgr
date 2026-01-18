import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EditItemForm } from './EditItemForm';

const meta = {
  title: 'Components/EditItemForm',
  component: EditItemForm,
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
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EditItemForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    itemId: 1,
    onSuccess: () => console.log('Success'),
    onCancel: () => console.log('Cancel'),
  },
  parameters: {
    // Note: This will fail in Storybook without mocking the query
    // In a real scenario, you'd use MSW or mock the hook
  },
};
