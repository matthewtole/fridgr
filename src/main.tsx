import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './lib/router'
import './styles/global.css'

// Initialize router context with default auth state
// This will be updated by AuthProvider in __root.tsx
router.update({
  context: {
    auth: {
      user: null,
      loading: true,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
