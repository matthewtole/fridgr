import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../../contexts/AuthContext'
import { css } from '../../../styled-system/css'

export const Route = createFileRoute('/_authenticated/')({
  component: HomePage,
})

function HomePage() {
  const { user, signOut } = useAuth()

  return (
    <div
      className={css({
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
      })}
    >
      <h1
        className={css({
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
        })}
      >
        Fridgr
      </h1>
      <p
        className={css({
          marginBottom: '2rem',
          color: 'gray.600',
        })}
      >
        Welcome, {user?.email}
      </p>
      <button
        onClick={() => signOut()}
        className={css({
          padding: '0.75rem 1.5rem',
          backgroundColor: 'red.500',
          color: 'white',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          _hover: {
            backgroundColor: 'red.600',
          },
        })}
      >
        Sign Out
      </button>
    </div>
  )
}
