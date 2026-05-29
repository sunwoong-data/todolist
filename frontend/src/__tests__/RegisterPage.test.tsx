import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import RegisterPage from '../pages/RegisterPage'
import * as authApi from '../api/authApi'

vi.mock('../api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
}))

function renderRegisterPage() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: 0 } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<div data-testid="login-page">로그인</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('회원가입 폼이 렌더링된다', () => {
    renderRegisterPage()
    expect(screen.getByLabelText(/이름/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /회원가입/ })).toBeInTheDocument()
  })

  it('로그인 링크가 렌더링된다', () => {
    renderRegisterPage()
    expect(screen.getByRole('link', { name: '로그인' })).toBeInTheDocument()
  })

  it('이름/이메일/비밀번호 입력이 동작한다', async () => {
    renderRegisterPage()
    await userEvent.type(screen.getByLabelText(/이름/i), '홍길동')
    await userEvent.type(screen.getByLabelText(/이메일/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/비밀번호/i), 'password123')
    expect(screen.getByLabelText(/이름/i)).toHaveValue('홍길동')
    expect(screen.getByLabelText(/이메일/i)).toHaveValue('test@example.com')
    expect(screen.getByLabelText(/비밀번호/i)).toHaveValue('password123')
  })

  it('회원가입 성공 시 /login으로 이동한다', async () => {
    vi.mocked(authApi.authApi.register).mockResolvedValueOnce({
      id: 'user-1',
      email: 'test@example.com',
      name: '홍길동',
      themePreference: 'dark',
      languagePreference: 'ko',
      createdAt: '2026-05-28T00:00:00.000Z',
      updatedAt: '2026-05-28T00:00:00.000Z',
    })

    renderRegisterPage()
    await userEvent.type(screen.getByLabelText(/이름/i), '홍길동')
    await userEvent.type(screen.getByLabelText(/이메일/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/비밀번호/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /회원가입/ }))

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument()
    })
  })

  it('중복 이메일 에러 시 에러 메시지를 표시한다', async () => {
    const axiosError = {
      response: { data: { error: { code: 'DUPLICATE_EMAIL', message: '이미 사용 중인 이메일입니다.' } } },
    }
    vi.mocked(authApi.authApi.register).mockRejectedValueOnce(axiosError)

    renderRegisterPage()
    await userEvent.type(screen.getByLabelText(/이름/i), '홍길동')
    await userEvent.type(screen.getByLabelText(/이메일/i), 'existing@example.com')
    await userEvent.type(screen.getByLabelText(/비밀번호/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /회원가입/ }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('이미 사용 중인 이메일입니다.')
    })
  })

  it('서버 오류 시 기본 에러 메시지를 표시한다', async () => {
    vi.mocked(authApi.authApi.register).mockRejectedValueOnce({ response: null })

    renderRegisterPage()
    await userEvent.type(screen.getByLabelText(/이름/i), '홍길동')
    await userEvent.type(screen.getByLabelText(/이메일/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/비밀번호/i), 'password')
    await userEvent.click(screen.getByRole('button', { name: /회원가입/ }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('회원가입에 실패했습니다.')
    })
  })

  it('로딩 중 버튼이 비활성화된다', async () => {
    vi.mocked(authApi.authApi.register).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    )

    renderRegisterPage()
    await userEvent.type(screen.getByLabelText(/이름/i), '홍길동')
    await userEvent.type(screen.getByLabelText(/이메일/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/비밀번호/i), 'password')
    await userEvent.click(screen.getByRole('button', { name: /회원가입/ }))

    expect(screen.getByRole('button', { name: /회원가입/ })).toBeDisabled()
  })
})
