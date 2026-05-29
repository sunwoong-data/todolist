import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import PublicOnlyRoute from '../components/router/PublicOnlyRoute'

function setup(isAuthenticated: boolean, initialPath = '/login') {
  useAuthStore.setState({ isAuthenticated })
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<div data-testid="home-page">홈</div>} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<div data-testid="login-page">로그인</div>} />
          <Route path="/register" element={<div data-testid="register-page">회원가입</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('PublicOnlyRoute', () => {
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

  it('미인증 상태에서 /login 접근 시 로그인 페이지를 렌더링한다', () => {
    setup(false, '/login')
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByTestId('home-page')).not.toBeInTheDocument()
  })

  it('미인증 상태에서 /register 접근 시 회원가입 페이지를 렌더링한다', () => {
    setup(false, '/register')
    expect(screen.getByTestId('register-page')).toBeInTheDocument()
    expect(screen.queryByTestId('home-page')).not.toBeInTheDocument()
  })

  it('인증 상태에서 /login 접근 시 /로 리다이렉트된다', () => {
    setup(true, '/login')
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
  })

  it('인증 상태에서 /register 접근 시 /로 리다이렉트된다', () => {
    setup(true, '/register')
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
    expect(screen.queryByTestId('register-page')).not.toBeInTheDocument()
  })
})
