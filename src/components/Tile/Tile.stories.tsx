import { Meta, StoryObj } from '@storybook/react-vite';
import {
  IconScan,
  IconSearch,
  IconMicrophone,
  IconApps,
  IconPlus,
} from '@tabler/icons-react';
import { Tile } from './Tile';
import { css } from '../../../styled-system/css';

const meta = {
  title: 'Components/Tile',
  component: Tile,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['scan', 'search', 'voice', 'browse', 'addItem'],
    },
  },
} satisfies Meta<typeof Tile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scan: Story = {
  args: {
    variant: 'scan',
    label: 'Scan Item',
    icon: <IconScan size={28} />,
  },
};

export const Search: Story = {
  args: {
    variant: 'search',
    label: 'Search',
    icon: <IconSearch size={28} />,
  },
};

export const Voice: Story = {
  args: {
    variant: 'voice',
    label: 'Voice',
    icon: <IconMicrophone size={28} />,
  },
};

export const Browse: Story = {
  args: {
    variant: 'browse',
    label: 'Browse',
    icon: <IconApps size={28} />,
  },
};

export const AddItem: Story = {
  args: {
    variant: 'addItem',
    label: 'Add Item',
    icon: <IconPlus size={28} />,
  },
};

export const AllTiles: Story = {
  args: { label: '' },
  render: () => (
    <div
      className={css({
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '3',
        maxWidth: '24rem',
      })}
    >
      <Tile
        variant="scan"
        label="Scan Item"
        icon={<IconScan size={28} />}
        className={css({ gridColumn: '1 / -1' })}
      />
      <Tile variant="search" label="Search" icon={<IconSearch size={28} />} />
      <Tile variant="voice" label="Voice" icon={<IconMicrophone size={28} />} />
      <Tile variant="browse" label="Browse" icon={<IconApps size={28} />} />
      <Tile variant="addItem" label="Add Item" icon={<IconPlus size={28} />} />
    </div>
  ),
};
