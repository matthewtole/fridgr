import { useAuth } from '../../contexts/AuthContext'
import { css } from '../../../styled-system/css'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header
      className={css({
        padding: '1rem 2rem',
        borderBottom: '1px solid',
        borderColor: 'gray.200',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
      })}
    >
      <h1
        className={css({
          fontSize: '1.5rem',
          fontWeight: 'bold',
        })}
      >
        Fridgr
      </h1>
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        })}
      >
        <span
          className={css({
            color: 'gray.600',
            fontSize: '0.875rem',
          })}
        >
          {user?.email}
        </span>
        <button
          onClick={() => signOut()}
          className={css({
            padding: '0.5rem 1rem',
            backgroundColor: 'red.500',
            color: 'white',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            _hover: {
              backgroundColor: 'red.600',
            },
          })}
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}
