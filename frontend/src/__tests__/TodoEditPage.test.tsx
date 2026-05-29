import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import TodoEditPage from '../pages/TodoEditPage'
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
  id: 'todo-1', userId: 'u1', categoryId: 'cat-1', assigneeId: null, title: '기존 제목',
  description: '기존 설명', startDate: '2026-06-01', endDate: '2026-06-30',
  isCompleted: false, createdAt: '', updatedAt: '',
}

function renderPage(todoId = 'todo-1') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/todos/${todoId}/edit`]}>
        <Routes>
          <Route path="/todos/:id/edit" element={<TodoEditPage />} />
          <Route path="/" element={<div data-testid="home-page">홈</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('TodoEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ userId: 'u1', token: 'tok', name: '홍길동', isAuthenticated: true, themePreference: 'dark', languagePreference: 'ko' })
    vi.mocked(categoryApiModule.categoryApi.getCategories).mockResolvedValue([
      { id: 'cat-1', userId: 'u1', name: '기본', isDefault: true },
    ])
  })

  it('"할 일 수정" 제목이 렌더링된다', async () => {
    vi.mocked(todoApiModule.todoApi.getTodo).mockResolvedValueOnce(mockTodo)
    renderPage()
    expect(await screen.findByText('할 일 수정')).toBeInTheDocument()
  })

  it('기존 Todo 데이터가 폼에 초기값으로 설정된다', async () => {
    vi.mocked(todoApiModule.todoApi.getTodo).mockResolvedValueOnce(mockTodo)
    renderPage()
    const titleInput = await screen.findByLabelText(/제목/i)
    expect(titleInput).toHaveValue('기존 제목')
  })

  it('저장 버튼이 렌더링된다', async () => {
    vi.mocked(todoApiModule.todoApi.getTodo).mockResolvedValueOnce(mockTodo)
    renderPage()
    expect(await screen.findByRole('button', { name: '저장' })).toBeInTheDocument()
  })

  it('수정 성공 시 /로 이동한다', async () => {
    vi.mocked(todoApiModule.todoApi.getTodo).mockResolvedValueOnce(mockTodo)
    vi.mocked(todoApiModule.todoApi.updateTodo).mockResolvedValueOnce({
      ...mockTodo, title: '수정된 제목',
    })

    renderPage()
    await screen.findByLabelText(/제목/i)
    await userEvent.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument()
    })
  })

  it('취소 버튼 클릭 시 /로 이동한다', async () => {
    vi.mocked(todoApiModule.todoApi.getTodo).mockResolvedValueOnce(mockTodo)
    renderPage()
    await screen.findByRole('button', { name: '취소' })
    await userEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
  })

  it('API 에러 시 /로 리다이렉트된다', async () => {
    vi.mocked(todoApiModule.todoApi.getTodo).mockRejectedValueOnce({ response: { status: 404 } })
    renderPage()
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument()
    })
  })

  it('로딩 중 스켈레톤이 렌더링된다', () => {
    vi.mocked(todoApiModule.todoApi.getTodo).mockImplementation(() => new Promise(() => {}))
    renderPage()
    expect(screen.getByLabelText('로딩 중')).toBeInTheDocument()
  })

  it('updateTodo가 올바른 id와 데이터로 호출된다', async () => {
    vi.mocked(todoApiModule.todoApi.getTodo).mockResolvedValueOnce(mockTodo)
    vi.mocked(todoApiModule.todoApi.updateTodo).mockResolvedValueOnce(mockTodo)

    renderPage()
    await screen.findByLabelText(/제목/i)
    await userEvent.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => {
      expect(todoApiModule.todoApi.updateTodo).toHaveBeenCalledWith(
        'todo-1',
        expect.objectContaining({ title: '기존 제목' })
      )
    })
  })
})
