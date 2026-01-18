import { Link } from '@tanstack/react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../Button/Button';
import { css } from '../../../styled-system/css';
import { IconLogout } from '@tabler/icons-react';

export function Header() {
  const { signOut } = useAuth();

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
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
        })}
      >
        <Link
          to="/"
          className={css({
            fontFamily: "'Miriam Libre', var(--font-fallback)",
            fontSize: '1.2rem',
            lineHeight: '1',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            color: 'inherit',
            textDecoration: 'none',
          })}
        >
          Fridgr
        </Link>
        <Link
          to="/inventory"
          className={css({
            fontSize: '0.875rem',
            color: 'gray.600',
            textDecoration: 'none',
            _hover: { color: 'gray.900', textDecoration: 'underline' },
          })}
        >
          Inventory
        </Link>
      </div>
      <Button variant="outline" size="small" onClick={() => signOut()}>
        <IconLogout size={16} />
      </Button>
    </header>
  );
}
