import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import * as authApi from '../api/authApi'
import { useAuthStore } from '../store/authStore'

vi.mock('../api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
}))

function renderLoginPage(initialPath = '/login') {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: 0 } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div data-testid="home-page">홈</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      userId: null, token: null, name: null,
      isAuthenticated: false, themePreference: 'dark', languagePreference: 'ko',
    })
  })

  it('로그인 폼이 렌더링된다', () => {
    renderLoginPage()
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /로그인/ })).toBeInTheDocument()
  })

  it('회원가입 링크가 렌더링된다', () => {
    renderLoginPage()
    expect(screen.getByRole('link', { name: '회원가입' })).toBeInTheDocument()
  })

  it('이메일/비밀번호 입력이 동작한다', async () => {
    renderLoginPage()
    await userEvent.type(screen.getByLabelText(/이메일/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/비밀번호/i), 'password123')
    expect(screen.getByLabelText(/이메일/i)).toHaveValue('test@example.com')
    expect(screen.getByLabelText(/비밀번호/i)).toHaveValue('password123')
  })

  it('로그인 성공 시 /로 이동한다', async () => {
    vi.mocked(authApi.authApi.login).mockResolvedValueOnce({
      token: 'jwt-token',
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: '홍길동',
        themePreference: 'dark',
        languagePreference: 'ko',
        createdAt: '2026-05-28T00:00:00.000Z',
        updatedAt: '2026-05-28T00:00:00.000Z',
      },
    })

    renderLoginPage()
    await userEvent.type(screen.getByLabelText(/이메일/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/비밀번호/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /로그인/ }))

    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument()
    })
  })

  it('로그인 성공 시 authStore가 업데이트된다', async () => {
    vi.mocked(authApi.authApi.login).mockResolvedValueOnce({
      token: 'jwt-token',
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: '홍길동',
        themePreference: 'dark',
        languagePreference: 'ko',
        createdAt: '2026-05-28T00:00:00.000Z',
        updatedAt: '2026-05-28T00:00:00.000Z',
      },
    })

    renderLoginPage()
    await userEvent.type(screen.getByLabelText(/이메일/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/비밀번호/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /로그인/ }))

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().token).toBe('jwt-token')
    })
  })

  it('로그인 실패 시 서버 에러 메시지를 표시한다', async () => {
    const axiosError = {
      response: { data: { error: { code: 'INVALID_CREDENTIALS', message: '이메일 또는 비밀번호가 올바르지 않습니다.' } } },
    }
    vi.mocked(authApi.authApi.login).mockRejectedValueOnce(axiosError)

    renderLoginPage()
    await userEvent.type(screen.getByLabelText(/이메일/i), 'wrong@example.com')
    await userEvent.type(screen.getByLabelText(/비밀번호/i), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: /로그인/ }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('이메일 또는 비밀번호가 올바르지 않습니다.')
    })
  })

  it('로그인 실패 시 기본 에러 메시지를 표시한다', async () => {
    vi.mocked(authApi.authApi.login).mockRejectedValueOnce({ response: null })

    renderLoginPage()
    await userEvent.type(screen.getByLabelText(/이메일/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/비밀번호/i), 'password')
    await userEvent.click(screen.getByRole('button', { name: /로그인/ }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('로그인에 실패했습니다.')
    })
  })

  it('로딩 중 버튼이 비활성화된다', async () => {
    vi.mocked(authApi.authApi.login).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    )

    renderLoginPage()
    await userEvent.type(screen.getByLabelText(/이메일/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/비밀번호/i), 'password')
    await userEvent.click(screen.getByRole('button', { name: /로그인/ }))

    expect(screen.getByRole('button', { name: /로그인/ })).toBeDisabled()
  })
})
