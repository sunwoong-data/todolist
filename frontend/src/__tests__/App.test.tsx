import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import App from '../App'

function renderApp() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: 0 } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
}

describe('App', () => {
  beforeEach(() => {
    useAuthStore.setState({
      userId: null, token: null, name: null,
      isAuthenticated: false, themePreference: 'dark', languagePreference: 'ko',
    })
  })

  it('미인증 상태에서 앱이 렌더링된다 (/ → /login 리다이렉트)', () => {
    renderApp()
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument()
  })
})
