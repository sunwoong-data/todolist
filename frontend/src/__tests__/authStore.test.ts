import { describe, it, expect, beforeEach } from 'vitest'
import { act } from 'react'
import { useAuthStore } from '../store/authStore'

const mockLoginPayload = {
  userId: 'uuid-1',
  token: 'jwt-token',
  name: '홍길동',
  themePreference: 'dark' as const,
  languagePreference: 'ko' as const,
}

describe('authStore', () => {
  beforeEach(() => {
    // 각 테스트 전 스토어 초기화
    useAuthStore.getState().logout()
  })

  it('초기 상태에서 isAuthenticated가 false이다', () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.token).toBeNull()
    expect(state.userId).toBeNull()
  })

  it('login() 호출 시 인증 상태가 업데이트된다', () => {
    act(() => {
      useAuthStore.getState().login(mockLoginPayload)
    })
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.userId).toBe('uuid-1')
    expect(state.token).toBe('jwt-token')
    expect(state.name).toBe('홍길동')
    expect(state.themePreference).toBe('dark')
    expect(state.languagePreference).toBe('ko')
  })

  it('logout() 호출 시 인증 상태가 초기화된다', () => {
    act(() => {
      useAuthStore.getState().login(mockLoginPayload)
    })
    act(() => {
      useAuthStore.getState().logout()
    })
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.token).toBeNull()
    expect(state.userId).toBeNull()
    expect(state.name).toBeNull()
  })

  it('updateName() 호출 시 이름이 업데이트된다', () => {
    act(() => {
      useAuthStore.getState().login(mockLoginPayload)
    })
    act(() => {
      useAuthStore.getState().updateName('김철수')
    })
    expect(useAuthStore.getState().name).toBe('김철수')
  })

  it('themePreference 기본값은 "dark"이다', () => {
    const state = useAuthStore.getState()
    expect(state.themePreference).toBe('dark')
  })

  it('languagePreference 기본값은 "ko"이다', () => {
    const state = useAuthStore.getState()
    expect(state.languagePreference).toBe('ko')
  })

  it('login 후 다른 themePreference 값이 저장된다', () => {
    act(() => {
      useAuthStore.getState().login({ ...mockLoginPayload, themePreference: 'light' })
    })
    expect(useAuthStore.getState().themePreference).toBe('light')
  })

  it('login 후 다른 languagePreference 값이 저장된다', () => {
    act(() => {
      useAuthStore.getState().login({ ...mockLoginPayload, languagePreference: 'en' })
    })
    expect(useAuthStore.getState().languagePreference).toBe('en')
  })
})
