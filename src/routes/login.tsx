import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { Login } from '../pages/Login/Login'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/login' })
  const redirect = (search as { redirect?: string })?.redirect

  return (
    <Login
      onSuccess={() => {
        navigate({
          to: redirect || '/',
          replace: true,
        })
      }}
    />
  )
}
