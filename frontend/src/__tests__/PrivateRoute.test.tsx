import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import PrivateRoute from '../components/router/PrivateRoute'

function setup(isAuthenticated: boolean, initialPath = '/') {
  useAuthStore.setState({ isAuthenticated })
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div data-testid="login-page">로그인</div>} />
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<div data-testid="protected-page">보호된 페이지</div>} />
          <Route path="/todos/new" element={<div data-testid="todo-new-page">새 할 일</div>} />
          <Route path="/todos/:id/edit" element={<div data-testid="todo-edit-page">수정</div>} />
          <Route path="/profile" element={<div data-testid="profile-page">프로필</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('PrivateRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      userId: null,
      token: null,
      name: null,
      isAuthenticated: false,
      themePreference: 'dark',
      languagePreference: 'ko',
    })
  })

  it('미인증 상태에서 / 접근 시 /login으로 리다이렉트된다', () => {
    setup(false, '/')
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-page')).not.toBeInTheDocument()
  })

  it('미인증 상태에서 /todos/new 접근 시 /login으로 리다이렉트된다', () => {
    setup(false, '/todos/new')
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByTestId('todo-new-page')).not.toBeInTheDocument()
  })

  it('미인증 상태에서 /todos/:id/edit 접근 시 /login으로 리다이렉트된다', () => {
    setup(false, '/todos/abc-123/edit')
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByTestId('todo-edit-page')).not.toBeInTheDocument()
  })

  it('미인증 상태에서 /profile 접근 시 /login으로 리다이렉트된다', () => {
    setup(false, '/profile')
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByTestId('profile-page')).not.toBeInTheDocument()
  })

  it('인증 상태에서 / 접근 시 보호된 페이지를 렌더링한다', () => {
    setup(true, '/')
    expect(screen.getByTestId('protected-page')).toBeInTheDocument()
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
  })

  it('인증 상태에서 /todos/new 접근 시 페이지를 렌더링한다', () => {
    setup(true, '/todos/new')
    expect(screen.getByTestId('todo-new-page')).toBeInTheDocument()
  })

  it('인증 상태에서 /todos/:id/edit 접근 시 페이지를 렌더링한다', () => {
    setup(true, '/todos/abc-123/edit')
    expect(screen.getByTestId('todo-edit-page')).toBeInTheDocument()
  })

  it('인증 상태에서 /profile 접근 시 페이지를 렌더링한다', () => {
    setup(true, '/profile')
    expect(screen.getByTestId('profile-page')).toBeInTheDocument()
  })
})
