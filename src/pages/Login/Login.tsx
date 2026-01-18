import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ErrorDisplay } from '../../components/ErrorDisplay/ErrorDisplay';
import { Button } from '../../components/Button/Button';
import { TextInput } from '../../components/TextInput/TextInput';
import { css } from '../../../styled-system/css';

interface LoginProps {
  onSuccess: () => void;
}

export function Login({ onSuccess }: LoginProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message || 'Invalid email or password. Please try again.');
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <div
      className={css({
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'gray.50',
      })}
    >
      <div
        className={css({
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        })}
      >
        <h1
          className={css({
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            textAlign: 'center',
          })}
        >
          Sign In
        </h1>

        {error && (
          <ErrorDisplay message={error} onDismiss={() => setError(null)} />
        )}

        <form onSubmit={handleSubmit}>
          <div
            className={css({
              marginBottom: '1rem',
            })}
          >
            <label
              htmlFor="email"
              className={css({
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'medium',
              })}
            >
              Email
            </label>
            <TextInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div
            className={css({
              marginBottom: '1.5rem',
            })}
          >
            <label
              htmlFor="password"
              className={css({
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'medium',
              })}
            >
              Password
            </label>
            <TextInput
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            variant="solid"
            color="sky"
            disabled={loading}
            loading={loading}
            className={css({ width: '100%' })}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
