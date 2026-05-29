import { describe, it, expect } from 'vitest'
import type { Todo, TodoStatus, CreateTodoRequest, UpdateTodoRequest, TodoFilter } from '../types/todo'
import type { User, Theme, Language, LoginResponse } from '../types/user'
import type { Category, CreateCategoryRequest } from '../types/category'
import type { ApiError } from '../types/api'

describe('타입 정의', () => {
  describe('Todo 타입', () => {
    it('Todo 객체가 올바르게 타입이 할당된다', () => {
      const todo: Todo = {
        id: 'uuid-1',
        userId: 'uuid-2',
        categoryId: 'uuid-3',
        assigneeId: null,
        title: '테스트',
        description: null,
        startDate: null,
        endDate: null,
        isCompleted: false,
        createdAt: '2026-05-28T00:00:00.000Z',
        updatedAt: '2026-05-28T00:00:00.000Z',
      }
      expect(todo.id).toBe('uuid-1')
      expect(todo.isCompleted).toBe(false)
    })

    it('TodoStatus 값이 올바르다', () => {
      const statuses: TodoStatus[] = ['pending', 'in_progress', 'overdue', 'completed']
      expect(statuses).toHaveLength(4)
    })

    it('CreateTodoRequest는 title만 필수이다', () => {
      const req: CreateTodoRequest = { title: '새 할 일' }
      expect(req.title).toBe('새 할 일')
      expect(req.description).toBeUndefined()
    })

    it('UpdateTodoRequest는 모든 필드가 선택값이다', () => {
      const req: UpdateTodoRequest = {}
      expect(Object.keys(req)).toHaveLength(0)
    })

    it('TodoFilter는 status와 categoryId를 가질 수 있다', () => {
      const filter: TodoFilter = { status: 'in_progress', categoryId: 'uuid-3' }
      expect(filter.status).toBe('in_progress')
    })
  })

  describe('User 타입', () => {
    it('User 객체가 올바르게 타입이 할당된다', () => {
      const user: User = {
        id: 'uuid-1',
        email: 'test@example.com',
        name: '홍길동',
        themePreference: 'dark',
        languagePreference: 'ko',
        createdAt: '2026-05-28T00:00:00.000Z',
        updatedAt: '2026-05-28T00:00:00.000Z',
      }
      expect(user.themePreference).toBe('dark')
    })

    it('Theme 타입 값이 올바르다', () => {
      const themes: Theme[] = ['light', 'dark']
      expect(themes).toHaveLength(2)
    })

    it('Language 타입 값이 올바르다', () => {
      const langs: Language[] = ['ko', 'en', 'ja']
      expect(langs).toHaveLength(3)
    })

    it('LoginResponse는 token과 user를 가진다', () => {
      const res: LoginResponse = {
        token: 'jwt-token',
        user: {
          id: 'uuid-1', email: 'test@example.com', name: '홍길동',
          themePreference: 'light', languagePreference: 'ko',
          createdAt: '', updatedAt: '',
        }
      }
      expect(res.token).toBe('jwt-token')
    })
  })

  describe('Category 타입', () => {
    it('Category 객체가 올바르게 타입이 할당된다', () => {
      const cat: Category = {
        id: 'uuid-1',
        userId: 'uuid-2',
        name: '기본',
        isDefault: true,
      }
      expect(cat.isDefault).toBe(true)
    })

    it('CreateCategoryRequest는 name이 필수이다', () => {
      const req: CreateCategoryRequest = { name: '업무' }
      expect(req.name).toBe('업무')
    })
  })

  describe('ApiError 타입', () => {
    it('ApiError가 올바른 구조를 가진다', () => {
      const err: ApiError = {
        error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' }
      }
      expect(err.error.code).toBe('UNAUTHORIZED')
    })
  })
})
