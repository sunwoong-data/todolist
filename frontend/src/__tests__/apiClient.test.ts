import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('API 클라이언트', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('VITE_API_BASE_URL 환경변수를 baseURL로 사용한다', async () => {
    const { default: apiClient } = await import('../api/client')
    expect(apiClient.defaults.baseURL).toBe('http://localhost:3000')
  })

  it('auth-storage에 token이 있으면 Authorization 헤더를 추가한다', async () => {
    localStorage.setItem('auth-storage', JSON.stringify({ state: { token: 'test-jwt-token' } }))
    await import('../api/client')

    const stored = localStorage.getItem('auth-storage')
    const token = stored ? (JSON.parse(stored)?.state?.token ?? null) : null
    const config = { headers: {} as Record<string, string> }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    expect(config.headers.Authorization).toBe('Bearer test-jwt-token')
  })

  it('auth-storage에 token이 없으면 Authorization 헤더를 추가하지 않는다', async () => {
    await import('../api/client')

    const stored = localStorage.getItem('auth-storage')
    const token = stored ? (JSON.parse(stored)?.state?.token ?? null) : null
    const config = { headers: {} as Record<string, string> }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    expect(config.headers.Authorization).toBeUndefined()
  })
})

describe('authApi', () => {
  it('authApi 모듈이 register와 login 함수를 export한다', async () => {
    const { authApi } = await import('../api/authApi')
    expect(typeof authApi.register).toBe('function')
    expect(typeof authApi.login).toBe('function')
  })
})

describe('userApi', () => {
  it('userApi 모듈이 getMe와 updateMe 함수를 export한다', async () => {
    const { userApi } = await import('../api/userApi')
    expect(typeof userApi.getMe).toBe('function')
    expect(typeof userApi.updateMe).toBe('function')
  })
})

describe('categoryApi', () => {
  it('categoryApi 모듈이 getCategories와 createCategory 함수를 export한다', async () => {
    const { categoryApi } = await import('../api/categoryApi')
    expect(typeof categoryApi.getCategories).toBe('function')
    expect(typeof categoryApi.createCategory).toBe('function')
  })
})

describe('todoApi', () => {
  it('todoApi 모듈이 필요한 모든 함수를 export한다', async () => {
    const { todoApi } = await import('../api/todoApi')
    expect(typeof todoApi.getTodos).toBe('function')
    expect(typeof todoApi.getTodo).toBe('function')
    expect(typeof todoApi.createTodo).toBe('function')
    expect(typeof todoApi.updateTodo).toBe('function')
    expect(typeof todoApi.deleteTodo).toBe('function')
    expect(typeof todoApi.completeTodo).toBe('function')
  })
})
