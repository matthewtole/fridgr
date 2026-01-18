import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { css } from '../../../styled-system/css';
import { Tile } from '../../components/Tile/Tile';
import { AddItemModal } from '../../components/AddItemForm/AddItemModal';
import { VoiceInputModal } from '../../components/VoiceInputModal/VoiceInputModal';
import {
  IconApps,
  IconMicrophone,
  IconScan,
  IconSearch,
  IconPlus,
} from '@tabler/icons-react';
import { TileLink } from '../../components/Tile/TileLink';
import { locationsQueryOptions } from '../../lib/queries/locations';

export const Route = createFileRoute('/_authenticated/')({
  loader: async ({ context }) => {
    context.queryClient.prefetchQuery(locationsQueryOptions());
  },
  component: HomePage,
});

function HomePage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '3',
        width: 'clamp(320px, 100vw, 800px)',
        margin: '0 auto',
      })}
    >
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3',
          padding: '4',
        })}
      >
        <Tile
          variant="scan"
          label="Scan Item"
          icon={<IconScan size={28} />}
          className={css({ gridColumn: '1 / -1' })}
        />
        <Tile variant="search" label="Search" icon={<IconSearch size={28} />} />
        <Tile
          variant="voice"
          label="Voice"
          icon={<IconMicrophone size={28} />}
          onClick={() => setIsVoiceModalOpen(true)}
        />
        <TileLink
          to="/inventory"
          variant="browse"
          label="Browse"
          icon={<IconApps size={28} />}
        />
        <Tile
          variant="addItem"
          label="Add Item"
          icon={<IconPlus size={28} />}
          onClick={() => setIsAddModalOpen(true)}
        />
      </div>

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
    </div>
  );
}
