import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useInventoryItems } from '../../hooks/useInventory'
import { InventoryTable } from '../../components/InventoryTable/InventoryTable'
import { AddItemModal } from '../../components/AddItemForm/AddItemModal'
import { BulkAddModal } from '../../components/BulkAddModal/BulkAddModal'
import { EditItemModal } from '../../components/EditItemForm/EditItemModal'
import { DeleteConfirmDialog } from '../../components/DeleteConfirmDialog/DeleteConfirmDialog'
import { LocationFilter } from '../../components/LocationFilter/LocationFilter'
import { Button } from '../../components/Button/Button'
import { css } from '../../../styled-system/css'

export const Route = createFileRoute('/_authenticated/')({
  component: InventoryPage,
})

function InventoryPage() {
  const [selectedLocationId, setSelectedLocationId] = useState<
    number | undefined
  >(undefined)
  const {
    data: items = [],
    isLoading,
    error,
  } = useInventoryItems(selectedLocationId)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingItem, setDeletingItem] = useState<{
    id: number
    name: string
  } | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false)

  const handleEdit = (id: number) => {
    setEditingId(id)
  }

  const handleDelete = (id: number) => {
    const item = items.find((i) => i.id === id)
    if (item) {
      setDeletingItem({
        id: item.id,
        name: item.products?.name || 'Manual Entry',
      })
    }
  }

  if (error) {
    return (
      <div
        className={css({
          padding: '2rem',
          textAlign: 'center',
          color: 'red.600',
        })}
      >
        Error loading inventory:{' '}
        {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }

  return (
    <div
      className={css({
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
      })}
    >
      <div
        className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        })}
      >
        <h1
          className={css({
            fontSize: '2rem',
            fontWeight: 'bold',
          })}
        >
          Inventory
        </h1>
        <div
          className={css({
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
          })}
        >
          <LocationFilter
            value={selectedLocationId}
            onChange={setSelectedLocationId}
          />
          <Button
            variant="solid"
            color="mauve"
            onClick={() => setIsBulkAddModalOpen(true)}
          >
            Bulk Add
          </Button>
          <Button
            color="frost"
            variant="solid"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Item
          </Button>
        </div>
      </div>

      <InventoryTable
        data={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <BulkAddModal
        isOpen={isBulkAddModalOpen}
        onClose={() => setIsBulkAddModalOpen(false)}
      />

      <EditItemModal
        isOpen={editingId !== null}
        itemId={editingId}
        onClose={() => setEditingId(null)}
      />

      {deletingItem && (
        <DeleteConfirmDialog
          isOpen={true}
          itemName={deletingItem.name}
          itemId={deletingItem.id}
          onClose={() => setDeletingItem(null)}
        />
      )}
    </div>
  )
}
