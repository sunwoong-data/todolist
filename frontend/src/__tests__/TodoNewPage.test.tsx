import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import TodoNewPage from '../pages/TodoNewPage'
import { useAuthStore } from '../store/authStore'
import * as todoApiModule from '../api/todoApi'
import * as categoryApiModule from '../api/categoryApi'
import type { Todo } from '../types/todo'

vi.mock('../api/todoApi', () => ({
  todoApi: { getTodos: vi.fn(), getTodo: vi.fn(), createTodo: vi.fn(), updateTodo: vi.fn(), deleteTodo: vi.fn(), completeTodo: vi.fn() },
}))
vi.mock('../api/categoryApi', () => ({
  categoryApi: { getCategories: vi.fn(), createCategory: vi.fn() },
}))

const mockTodo: Todo = {
  id: 'todo-1', userId: 'u1', categoryId: 'cat-1', assigneeId: null, title: '새 할 일',
  description: null, startDate: null, endDate: null, isCompleted: false, createdAt: '', updatedAt: '',
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/todos/new']}>
        <Routes>
          <Route path="/todos/new" element={<TodoNewPage />} />
          <Route path="/" element={<div data-testid="home-page">홈</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('TodoNewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ userId: 'u1', token: 'tok', name: '홍길동', isAuthenticated: true, themePreference: 'dark', languagePreference: 'ko' })
    vi.mocked(categoryApiModule.categoryApi.getCategories).mockResolvedValue([
      { id: 'cat-1', userId: 'u1', name: '기본', isDefault: true },
    ])
  })

  it('"새 할 일 등록" 제목이 렌더링된다', () => {
    renderPage()
    expect(screen.getByText('새 할 일 등록')).toBeInTheDocument()
  })

  it('TodoForm이 렌더링된다 (제목 입력 필드 존재)', () => {
    renderPage()
    expect(screen.getByLabelText(/제목/i)).toBeInTheDocument()
  })

  it('등록 버튼이 렌더링된다', () => {
    renderPage()
    expect(screen.getByRole('button', { name: '등록' })).toBeInTheDocument()
  })

  it('등록 성공 시 /로 이동한다', async () => {
    vi.mocked(todoApiModule.todoApi.createTodo).mockResolvedValueOnce(mockTodo)

    renderPage()
    await userEvent.type(screen.getByLabelText(/제목/i), '새 할 일')
    await userEvent.click(screen.getByRole('button', { name: '등록' }))

    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument()
    })
  })

  it('취소 버튼 클릭 시 /로 이동한다', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
  })

  it('createTodo가 올바른 데이터로 호출된다', async () => {
    vi.mocked(todoApiModule.todoApi.createTodo).mockResolvedValueOnce(mockTodo)

    renderPage()
    await userEvent.type(screen.getByLabelText(/제목/i), '리액트 공부')
    await userEvent.click(screen.getByRole('button', { name: '등록' }))

    await waitFor(() => {
      expect(todoApiModule.todoApi.createTodo).toHaveBeenCalledWith(
        expect.objectContaining({ title: '리액트 공부' })
      )
    })
  })
})
