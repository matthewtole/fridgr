import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../Button/Button';
import { css } from '../../../styled-system/css';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header
      className={css({
        padding: '8px 16px',
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
          fontFamily: "'Miriam Libre', var(--font-fallback)",
          fontSize: '1.2rem',
          lineHeight: '1',
          fontWeight: 'bold',
          textTransform: 'uppercase',
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
        <Button
          variant="solid"
          color="rose"
          size="small"
          onClick={() => signOut()}
        >
          Sign Out
        </Button>
      </div>
    </header>
  );
}
