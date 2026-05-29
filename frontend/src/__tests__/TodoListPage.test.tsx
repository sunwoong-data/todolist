import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import TodoListPage from '../pages/TodoListPage'
import { useAuthStore } from '../store/authStore'
import { useFilterStore } from '../store/filterStore'
import * as todoApiModule from '../api/todoApi'
import * as categoryApiModule from '../api/categoryApi'
import * as assigneeApiModule from '../api/assigneeApi'
import * as holidayApiModule from '../api/holidayApi'
import type { Todo } from '../types/todo'

vi.mock('../api/todoApi', () => ({
  todoApi: { getTodos: vi.fn(), getTodo: vi.fn(), createTodo: vi.fn(), updateTodo: vi.fn(), deleteTodo: vi.fn(), completeTodo: vi.fn() },
}))
vi.mock('../api/categoryApi', () => ({
  categoryApi: { getCategories: vi.fn(), createCategory: vi.fn() },
}))
vi.mock('../api/assigneeApi', () => ({
  assigneeApi: { getAssignees: vi.fn(), createAssignee: vi.fn(), deleteAssignee: vi.fn() },
}))
vi.mock('../api/holidayApi', () => ({
  holidayApi: { getHolidays: vi.fn() },
}))

const mockTodos: Todo[] = [
  { id: 'todo-1', userId: 'u1', categoryId: 'cat-1', assigneeId: null, title: '할 일 1', description: null, startDate: null, endDate: null, isCompleted: false, createdAt: '2026-05-28T10:00:00.000Z', updatedAt: '2026-05-28T10:00:00.000Z' },
  { id: 'todo-2', userId: 'u1', categoryId: 'cat-1', assigneeId: null, title: '할 일 2', description: null, startDate: null, endDate: null, isCompleted: false, createdAt: '2026-05-29T09:00:00.000Z', updatedAt: '2026-05-29T09:00:00.000Z' },
]

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<TodoListPage />} />
          <Route path="/todos/new" element={<div data-testid="new-page">새 할 일</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('TodoListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ userId: 'u1', token: 'tok', name: '홍길동', isAuthenticated: true, themePreference: 'dark', languagePreference: 'ko' })
    useFilterStore.setState({ status: null, categoryId: null, assigneeId: null, viewMode: 'list' })
    vi.mocked(todoApiModule.todoApi.getTodos).mockResolvedValue(mockTodos)
    vi.mocked(categoryApiModule.categoryApi.getCategories).mockResolvedValue([
      { id: 'cat-1', userId: 'u1', name: '기본', isDefault: true },
    ])
    vi.mocked(assigneeApiModule.assigneeApi.getAssignees).mockResolvedValue([])
    vi.mocked(holidayApiModule.holidayApi.getHolidays).mockResolvedValue([])
  })

  it('NavBar가 렌더링된다', async () => {
    renderPage()
    expect(await screen.findByTestId('navbar-user')).toBeInTheDocument()
  })

  it('사용자 이름이 NavBar에 표시된다', async () => {
    renderPage()
    expect(await screen.findByTestId('navbar-user')).toHaveTextContent('홍길동')
  })

  it('Todo 목록이 렌더링된다', async () => {
    renderPage()
    expect(await screen.findByTestId('todo-item-todo-1')).toBeInTheDocument()
  })

  it('"+ 새 할 일" 버튼이 렌더링된다', async () => {
    renderPage()
    expect(await screen.findByTestId('new-todo-button')).toBeInTheDocument()
  })

  it('"+ 새 할 일" 버튼 클릭 시 /todos/new로 이동한다', async () => {
    renderPage()
    await userEvent.click(await screen.findByTestId('new-todo-button'))
    expect(screen.getByTestId('new-page')).toBeInTheDocument()
  })

  it('CategoryFilter가 렌더링된다', async () => {
    renderPage()
    expect(await screen.findByTestId('status-filter-all')).toBeInTheDocument()
  })

  it('로그아웃 버튼 클릭 시 authStore가 초기화된다', async () => {
    renderPage()
    await userEvent.click(await screen.findByTestId('logout-button'))
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('필터 선택 시 getTodos가 새 파라미터로 호출된다', async () => {
    renderPage()
    await screen.findByTestId('status-filter-pending')
    await userEvent.click(screen.getByTestId('status-filter-pending'))
    await waitFor(() => {
      expect(todoApiModule.todoApi.getTodos).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pending' })
      )
    })
  })

  it('신규 항목 섹션이 렌더링된다', async () => {
    renderPage()
    expect(await screen.findByTestId('new-items-section')).toBeInTheDocument()
  })

  it('신규 항목이 createdAt 오름차순으로 표시된다', async () => {
    renderPage()
    await screen.findByTestId('new-items-section')
    const item1 = screen.getByTestId('new-item-todo-1')
    const item2 = screen.getByTestId('new-item-todo-2')
    expect(item1).toBeInTheDocument()
    expect(item2).toBeInTheDocument()
    expect(item1.compareDocumentPosition(item2) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('뷰 전환 버튼(목록/캘린더)이 렌더링된다', async () => {
    renderPage()
    expect(await screen.findByTestId('view-mode-list')).toBeInTheDocument()
    expect(screen.getByTestId('view-mode-calendar')).toBeInTheDocument()
  })

  it('목록 뷰가 기본 활성 상태다', async () => {
    renderPage()
    const listBtn = await screen.findByTestId('view-mode-list')
    expect(listBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('캘린더 뷰 버튼 클릭 시 캘린더가 표시된다', async () => {
    renderPage()
    await userEvent.click(await screen.findByTestId('view-mode-calendar'))
    expect(await screen.findByTestId('calendar-header')).toBeInTheDocument()
  })

  it('목록 뷰 버튼 클릭 시 목록으로 돌아온다', async () => {
    renderPage()
    await userEvent.click(await screen.findByTestId('view-mode-calendar'))
    await screen.findByTestId('calendar-header')
    await userEvent.click(screen.getByTestId('view-mode-list'))
    expect(await screen.findByTestId('todo-item-todo-1')).toBeInTheDocument()
  })
})
