import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import type { InventoryItemWithRelations } from '../../lib/queries/inventory'
import { Button } from '../Button/Button'
import { css } from '../../../styled-system/css'

interface InventoryTableProps {
  data: InventoryItemWithRelations[]
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  isLoading?: boolean
}

const columnHelper = createColumnHelper<InventoryItemWithRelations>()

function formatDate(dateString: string | null): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getExpirationColor(expirationDate: string | null): string {
  if (!expirationDate) return 'gray.600'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expDate = new Date(expirationDate)
  expDate.setHours(0, 0, 0, 0)
  const diffDays = Math.floor(
    (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays < 0) return 'red.600' // Expired
  if (diffDays <= 3) return 'orange.600' // Expiring within 3 days
  if (diffDays <= 7) return 'yellow.600' // Expiring within 7 days
  return 'green.600' // Good
}

function formatQuantity(quantity: number, quantityType: string): string {
  const qty = Number(quantity)
  const type = quantityType.toLowerCase()
  return `${qty} ${type}`
}

export function InventoryTable({
  data,
  onEdit,
  onDelete,
  isLoading = false,
}: InventoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = [
    columnHelper.accessor((row) => row.products?.name || 'Manual Entry', {
      id: 'productName',
      header: 'Product Name',
      cell: (info) => (
        <span
          className={css({
            fontWeight: 'medium',
          })}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor(
      (row) => formatQuantity(row.quantity, row.quantity_type),
      {
        id: 'quantity',
        header: 'Quantity',
        cell: (info) => (
          <span
            className={css({
              color: 'gray.700',
            })}
          >
            {info.getValue()}
          </span>
        ),
      }
    ),
    columnHelper.accessor((row) => row.locations?.name || '—', {
      id: 'location',
      header: 'Location',
      cell: (info) => (
        <span
          className={css({
            color: 'gray.700',
            textTransform: 'capitalize',
          })}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.added_date, {
      id: 'addedDate',
      header: 'Added Date',
      cell: (info) => (
        <span
          className={css({
            color: 'gray.600',
            fontSize: '0.875rem',
          })}
        >
          {formatDate(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.expiration_date, {
      id: 'expirationDate',
      header: 'Expiration Date',
      cell: (info) => {
        const date = info.getValue()
        const color = getExpirationColor(date)
        return (
          <span
            className={css({
              color,
              fontSize: '0.875rem',
              fontWeight: date ? 'medium' : 'normal',
            })}
          >
            {formatDate(date)}
          </span>
        )
      },
    }),
    columnHelper.accessor((row) => row.opened_status, {
      id: 'openedStatus',
      header: 'Opened',
      cell: (info) => (
        <span
          className={css({
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: 'medium',
            backgroundColor: info.getValue() ? 'orange.100' : 'green.100',
            color: info.getValue() ? 'orange.800' : 'green.800',
          })}
        >
          {info.getValue() ? 'Opened' : 'Sealed'}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div
          className={css({
            display: 'flex',
            gap: '0.5rem',
          })}
        >
          <Button
            size="small"
            variant="solid"
            color="sky"
            onClick={() => onEdit(info.row.original.id)}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="solid"
            color="rose"
            onClick={() => onDelete(info.row.original.id)}
          >
            Delete
          </Button>
        </div>
      ),
    }),
  ]

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  if (isLoading) {
    return (
      <div
        className={css({
          padding: '2rem',
          textAlign: 'center',
          color: 'gray.600',
        })}
      >
        Loading inventory items...
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div
        className={css({
          padding: '2rem',
          textAlign: 'center',
          color: 'gray.600',
        })}
      >
        No inventory items found. Add your first item to get started!
      </div>
    )
  }

  return (
    <div
      className={css({
        overflowX: 'auto',
        border: '1px solid',
        borderColor: 'gray.200',
        borderRadius: '0.5rem',
      })}
    >
      <table
        className={css({
          width: '100%',
          borderCollapse: 'collapse',
        })}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className={css({
                backgroundColor: 'gray.50',
                borderBottom: '1px solid',
                borderColor: 'gray.200',
              })}
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={css({
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: 'semibold',
                    color: 'gray.700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: header.column.getCanSort() ? 'pointer' : 'default',
                    userSelect: 'none',
                    _hover: header.column.getCanSort()
                      ? {
                          backgroundColor: 'gray.100',
                        }
                      : {},
                  })}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    })}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getCanSort() && (
                      <span
                        className={css({
                          fontSize: '0.75rem',
                          color: 'gray.400',
                        })}
                      >
                        {{
                          asc: '↑',
                          desc: '↓',
                        }[header.column.getIsSorted() as string] ?? '↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={css({
                borderBottom: '1px solid',
                borderColor: 'gray.100',
                _hover: {
                  backgroundColor: 'gray.50',
                },
              })}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={css({
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                  })}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
