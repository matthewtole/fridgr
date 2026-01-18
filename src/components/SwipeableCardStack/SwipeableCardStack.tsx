import { useState } from 'react'
import { animated, useSprings } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { css } from '../../../styled-system/css'

interface SwipeableCardStackProps<T> {
  items: T[]
  renderCard: (item: T, index: number) => React.ReactNode
  onApprove: (item: T) => void
  onReject: (item: T) => void
  onEdit: (item: T, index: number) => void
}

const SWIPE_THRESHOLD = 100 // pixels to swipe before triggering action
const ROTATION_FACTOR = 0.1 // rotation per pixel of drag

export function SwipeableCardStack<T>({
  items,
  renderCard,
  onApprove,
  onReject,
  onEdit,
}: SwipeableCardStackProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasDragged, setHasDragged] = useState(false)
  const [dragStartTime, setDragStartTime] = useState(0)

  // Create springs for each card (only show top 3 cards)
  const [springs, api] = useSprings(
    Math.min(items.length - currentIndex, 3),
    (index) => ({
      x: 0,
      y: 0,
      rot: 0,
      scale: 1 - index * 0.05,
      opacity: 1,
      zIndex: items.length - currentIndex - index,
    })
  )

  const bind = useDrag(
    ({ active, movement: [mx, my], direction: [xDir], velocity: [vx], first, last }) => {
      const trigger = Math.abs(mx) > SWIPE_THRESHOLD || (vx > 0.5 && Math.abs(mx) > 50)
      const dir = xDir > 0 ? 1 : -1 // 1 = right (approve), -1 = left (reject)

      if (first) {
        setHasDragged(false)
        setDragStartTime(Date.now())
      }

      if (active) {
        // Only consider it a drag if movement is significant
        if (Math.abs(mx) > 5 || Math.abs(my) > 5) {
          setHasDragged(true)
        }

        // Update the top card position while dragging
        api.start((i) => {
          if (i !== 0) return // Only move the top card
          return {
            x: mx,
            y: my,
            rot: mx * ROTATION_FACTOR,
            scale: 1.05,
            immediate: true,
          }
        })
      } else if (last) {
        // Drag ended
        if (trigger && currentIndex < items.length) {
          // Swipe completed - trigger action
          const currentItem = items[currentIndex]
          if (dir > 0) {
            onApprove(currentItem)
          } else {
            onReject(currentItem)
          }

          // Animate card off screen
          api.start((i) => {
            if (i !== 0) return
            return {
              x: dir * 1000,
              y: my,
              rot: dir * 30,
              scale: 0.8,
              opacity: 0,
              config: { tension: 300, friction: 30 },
            }
          })

          // Move to next card after animation
          setTimeout(() => {
            setCurrentIndex((prev) => prev + 1)
            setHasDragged(false)
            // Reset springs for remaining cards
            api.start((i) => ({
              x: 0,
              y: 0,
              rot: 0,
              scale: 1 - i * 0.05,
              opacity: 1,
              immediate: false,
            }))
          }, 300)
        } else {
          // Snap back to center
          api.start((i) => {
            if (i !== 0) return
            return {
              x: 0,
              y: 0,
              rot: 0,
              scale: 1,
              config: { tension: 300, friction: 30 },
            }
          })
          // Reset drag state after a short delay to allow click to fire if no drag occurred
          setTimeout(() => {
            setHasDragged(false)
          }, 100)
        }
      }
    }
  )

  const handleCardClick = (e: React.MouseEvent) => {
    // Only open edit modal if:
    // 1. No significant drag occurred
    // 2. It was a quick tap (not a long press)
    // 3. We haven't processed all items
    const clickDuration = Date.now() - dragStartTime
    if (!hasDragged && clickDuration < 300 && currentIndex < items.length) {
      e.stopPropagation()
      onEdit(items[currentIndex], currentIndex)
    }
  }

  if (currentIndex >= items.length) {
    return (
      <div
        className={css({
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          color: 'gray.500',
          fontSize: '1.125rem',
        })}
      >
        All items processed!
      </div>
    )
  }

  return (
    <div
      className={css({
        position: 'relative',
        width: '100%',
        height: '500px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        touchAction: 'none',
      })}
    >
      {springs.map((spring, i) => {
        const itemIndex = currentIndex + i
        if (itemIndex >= items.length) return null

        return (
          <animated.div
            key={itemIndex}
            {...(i === 0 ? bind() : {})}
            onClick={i === 0 ? handleCardClick : undefined}
            style={{
              position: 'absolute',
              transform: spring.x.to(
                (x) =>
                  `translateX(${x}px) translateY(${spring.y.get()}px) rotate(${spring.rot.get()}deg) scale(${spring.scale.get()})`
              ),
              opacity: spring.opacity,
              zIndex: spring.zIndex.get(),
              cursor: i === 0 ? 'grab' : 'default',
            }}
            className={css({
              width: '100%',
              maxWidth: '400px',
              pointerEvents: i === 0 ? 'auto' : 'none',
            })}
          >
            {renderCard(items[itemIndex], itemIndex)}
          </animated.div>
        )
      })}

      {/* Action hints */}
      {currentIndex < items.length && (
        <>
          <div
            className={css({
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'red.100',
              color: 'red.700',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 'medium',
              pointerEvents: 'none',
              opacity: 0.3,
            })}
          >
            ← Reject
          </div>
          <div
            className={css({
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'green.100',
              color: 'green.700',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 'medium',
              pointerEvents: 'none',
              opacity: 0.3,
            })}
          >
            Approve →
          </div>
        </>
      )}

      {/* Progress indicator */}
      <div
        className={css({
          position: 'absolute',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '0.875rem',
          color: 'gray.600',
        })}
      >
        {currentIndex + 1} of {items.length}
      </div>
    </div>
  )
}
