import type { Meta, StoryObj } from '@storybook/react-vite';
import { BarcodeScanner } from './BarcodeScanner';

const meta = {
  title: 'Components/BarcodeScanner',
  component: BarcodeScanner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onScan: { action: 'onScan' },
    onClose: { action: 'onClose' },
    onManualEntry: { action: 'onManualEntry' },
  },
} satisfies Meta<typeof BarcodeScanner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Mock mode: no camera required. Shows a placeholder and "Simulate scan" for development and CI. */
export const Mock: Story = {
  args: {
    mock: true,
    onScan: () => {},
    onClose: () => {},
    onManualEntry: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use `mock={true}` when the camera is unavailable or for testing. Click "Simulate scan" to trigger `onScan` with a test barcode.',
      },
    },
  },
};

/** Tries to start the real camera. In CI or when the camera is denied, the error UI with Retry and "Enter manually" is shown. */
export const Default: Story = {
  args: {
    mock: false,
    onScan: () => {},
    onClose: () => {},
    onManualEntry: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'Uses the device camera when available. In environments without a camera or when permission is denied, the error state with Retry and "Enter barcode manually" is displayed.',
      },
    },
  },
};
