import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import ProfilePage from '../pages/ProfilePage'
import { useAuthStore } from '../store/authStore'
import * as userApiModule from '../api/userApi'
import type { User } from '../types/user'

vi.mock('../api/userApi', () => ({
  userApi: { getMe: vi.fn(), updateMe: vi.fn() },
}))

const mockUser: User = {
  id: 'u1',
  email: 'test@example.com',
  name: '홍길동',
  themePreference: 'dark',
  languagePreference: 'ko',
  createdAt: '',
  updatedAt: '',
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      userId: 'u1', token: 'tok', name: '홍길동', isAuthenticated: true,
      themePreference: 'dark', languagePreference: 'ko',
    })
  })

  it('현재 이름이 이름 입력 필드에 표시된다', () => {
    renderPage()
    expect(screen.getByLabelText('이름')).toHaveValue('홍길동')
  })

  it('NavBar가 렌더링된다', () => {
    renderPage()
    expect(screen.getByTestId('navbar-user')).toBeInTheDocument()
  })

  it('이름 저장 버튼이 렌더링된다', () => {
    renderPage()
    expect(screen.getByTestId('save-name-button')).toBeInTheDocument()
  })

  it('비밀번호 변경 버튼이 렌더링된다', () => {
    renderPage()
    expect(screen.getByTestId('save-password-button')).toBeInTheDocument()
  })

  it('이름 수정 성공 시 성공 메시지가 표시된다', async () => {
    vi.mocked(userApiModule.userApi.updateMe).mockResolvedValueOnce({ ...mockUser, name: '김철수' })

    renderPage()
    await userEvent.clear(screen.getByLabelText('이름'))
    await userEvent.type(screen.getByLabelText('이름'), '김철수')
    await userEvent.click(screen.getByTestId('save-name-button'))

    await waitFor(() => {
      expect(screen.getByTestId('name-success')).toBeInTheDocument()
    })
  })

  it('이름 수정 성공 시 authStore의 이름이 업데이트된다', async () => {
    vi.mocked(userApiModule.userApi.updateMe).mockResolvedValueOnce({ ...mockUser, name: '김철수' })

    renderPage()
    await userEvent.clear(screen.getByLabelText('이름'))
    await userEvent.type(screen.getByLabelText('이름'), '김철수')
    await userEvent.click(screen.getByTestId('save-name-button'))

    await waitFor(() => {
      expect(useAuthStore.getState().name).toBe('김철수')
    })
  })

  it('이름 수정 API 에러 시 에러 메시지가 표시된다', async () => {
    vi.mocked(userApiModule.userApi.updateMe).mockRejectedValueOnce({
      response: { data: { error: { message: '이름 수정 실패' } } },
    })

    renderPage()
    await userEvent.click(screen.getByTestId('save-name-button'))

    await waitFor(() => {
      expect(screen.getByTestId('name-error')).toBeInTheDocument()
    })
  })

  it('비밀번호 변경 성공 시 성공 메시지가 표시된다', async () => {
    vi.mocked(userApiModule.userApi.updateMe).mockResolvedValueOnce(mockUser)

    renderPage()
    await userEvent.type(screen.getByLabelText('새 비밀번호'), 'newpass123')
    await userEvent.click(screen.getByTestId('save-password-button'))

    await waitFor(() => {
      expect(screen.getByTestId('password-success')).toBeInTheDocument()
    })
  })

  it('비밀번호 변경 성공 시 비밀번호 입력 필드가 초기화된다', async () => {
    vi.mocked(userApiModule.userApi.updateMe).mockResolvedValueOnce(mockUser)

    renderPage()
    await userEvent.type(screen.getByLabelText('새 비밀번호'), 'newpass123')
    await userEvent.click(screen.getByTestId('save-password-button'))

    await waitFor(() => {
      expect(screen.getByLabelText('새 비밀번호')).toHaveValue('')
    })
  })

  it('비밀번호 변경 API 에러 시 에러 메시지가 표시된다', async () => {
    vi.mocked(userApiModule.userApi.updateMe).mockRejectedValueOnce({
      response: { data: { error: { message: '비밀번호 변경 실패' } } },
    })

    renderPage()
    await userEvent.type(screen.getByLabelText('새 비밀번호'), 'newpass123')
    await userEvent.click(screen.getByTestId('save-password-button'))

    await waitFor(() => {
      expect(screen.getByTestId('password-error')).toBeInTheDocument()
    })
  })

  it('updateMe가 이름 수정 시 name 필드로 호출된다', async () => {
    vi.mocked(userApiModule.userApi.updateMe).mockResolvedValueOnce({ ...mockUser, name: '이순신' })

    renderPage()
    await userEvent.clear(screen.getByLabelText('이름'))
    await userEvent.type(screen.getByLabelText('이름'), '이순신')
    await userEvent.click(screen.getByTestId('save-name-button'))

    await waitFor(() => {
      expect(userApiModule.userApi.updateMe).toHaveBeenCalledWith(
        expect.objectContaining({ name: '이순신' })
      )
    })
  })

  it('updateMe가 비밀번호 변경 시 password 필드로 호출된다', async () => {
    vi.mocked(userApiModule.userApi.updateMe).mockResolvedValueOnce(mockUser)

    renderPage()
    await userEvent.type(screen.getByLabelText('새 비밀번호'), 'secret123')
    await userEvent.click(screen.getByTestId('save-password-button'))

    await waitFor(() => {
      expect(userApiModule.userApi.updateMe).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'secret123' })
      )
    })
  })
})
