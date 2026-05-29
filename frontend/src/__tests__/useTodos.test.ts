import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { useGetTodos, useCreateTodo, useUpdateTodo, useDeleteTodo, useCompleteTodo, TODO_QUERY_KEY } from '../hooks/useTodos'
import * as todoApiModule from '../api/todoApi'
import type { Todo } from '../types/todo'

vi.mock('../api/todoApi', () => ({
  todoApi: {
    getTodos: vi.fn(),
    getTodo: vi.fn(),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
    completeTodo: vi.fn(),
  },
}))

const mockTodo: Todo = {
  id: 'todo-1',
  userId: 'user-1',
  categoryId: 'cat-1',
  assigneeId: null,
  title: '테스트 할 일',
  description: null,
  startDate: null,
  endDate: null,
  isCompleted: false,
  createdAt: '2026-05-28T00:00:00.000Z',
  updatedAt: '2026-05-28T00:00:00.000Z',
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } },
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useGetTodos', () => {
  beforeEach(() => vi.clearAllMocks())

  it('Todo 목록을 조회한다', async () => {
    vi.mocked(todoApiModule.todoApi.getTodos).mockResolvedValueOnce([mockTodo])
    const { result } = renderHook(() => useGetTodos(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockTodo])
  })

  it('필터를 전달해서 조회한다', async () => {
    vi.mocked(todoApiModule.todoApi.getTodos).mockResolvedValueOnce([])
    const { result } = renderHook(
      () => useGetTodos({ status: 'in_progress', categoryId: 'cat-1' }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(todoApiModule.todoApi.getTodos).toHaveBeenCalledWith({ status: 'in_progress', categoryId: 'cat-1' })
  })

  it('API 에러 시 isError가 true가 된다', async () => {
    vi.mocked(todoApiModule.todoApi.getTodos).mockRejectedValueOnce(new Error('Network Error'))
    const { result } = renderHook(() => useGetTodos(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useCreateTodo', () => {
  beforeEach(() => vi.clearAllMocks())

  it('Todo를 생성한다', async () => {
    vi.mocked(todoApiModule.todoApi.createTodo).mockResolvedValueOnce(mockTodo)
    vi.mocked(todoApiModule.todoApi.getTodos).mockResolvedValue([mockTodo])

    const { result } = renderHook(() => useCreateTodo(), { wrapper: createWrapper() })
    result.current.mutate({ title: '테스트 할 일' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(todoApiModule.todoApi.createTodo).toHaveBeenCalledWith({ title: '테스트 할 일' })
  })

  it('생성 성공 시 todos 쿼리를 무효화한다', async () => {
    vi.mocked(todoApiModule.todoApi.createTodo).mockResolvedValueOnce(mockTodo)
    vi.mocked(todoApiModule.todoApi.getTodos).mockResolvedValue([mockTodo])

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } } })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useCreateTodo(), { wrapper })
    result.current.mutate({ title: '새 할 일' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: TODO_QUERY_KEY })
  })
})

describe('useUpdateTodo', () => {
  beforeEach(() => vi.clearAllMocks())

  it('Todo를 수정한다', async () => {
    const updated = { ...mockTodo, title: '수정된 할 일' }
    vi.mocked(todoApiModule.todoApi.updateTodo).mockResolvedValueOnce(updated)

    const { result } = renderHook(() => useUpdateTodo(), { wrapper: createWrapper() })
    result.current.mutate({ id: 'todo-1', data: { title: '수정된 할 일' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(todoApiModule.todoApi.updateTodo).toHaveBeenCalledWith('todo-1', { title: '수정된 할 일' })
  })

  it('수정 성공 시 todos 쿼리를 무효화한다', async () => {
    vi.mocked(todoApiModule.todoApi.updateTodo).mockResolvedValueOnce(mockTodo)

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } } })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useUpdateTodo(), { wrapper })
    result.current.mutate({ id: 'todo-1', data: { title: '수정' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: TODO_QUERY_KEY })
  })
})

describe('useDeleteTodo', () => {
  beforeEach(() => vi.clearAllMocks())

  it('Todo를 삭제한다', async () => {
    vi.mocked(todoApiModule.todoApi.deleteTodo).mockResolvedValueOnce({ message: '삭제되었습니다.' })

    const { result } = renderHook(() => useDeleteTodo(), { wrapper: createWrapper() })
    result.current.mutate('todo-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(todoApiModule.todoApi.deleteTodo).toHaveBeenCalledWith('todo-1')
  })

  it('삭제 성공 시 todos 쿼리를 무효화한다', async () => {
    vi.mocked(todoApiModule.todoApi.deleteTodo).mockResolvedValueOnce({ message: 'OK' })

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } } })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useDeleteTodo(), { wrapper })
    result.current.mutate('todo-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: TODO_QUERY_KEY })
  })
})

describe('useCompleteTodo', () => {
  beforeEach(() => vi.clearAllMocks())

  it('Todo를 완료 처리한다', async () => {
    const completed = { ...mockTodo, isCompleted: true }
    vi.mocked(todoApiModule.todoApi.completeTodo).mockResolvedValueOnce(completed)

    const { result } = renderHook(() => useCompleteTodo(), { wrapper: createWrapper() })
    result.current.mutate('todo-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(todoApiModule.todoApi.completeTodo).toHaveBeenCalledWith('todo-1')
  })

  it('완료 처리 성공 시 todos 쿼리를 무효화한다', async () => {
    vi.mocked(todoApiModule.todoApi.completeTodo).mockResolvedValueOnce({ ...mockTodo, isCompleted: true })

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } } })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useCompleteTodo(), { wrapper })
    result.current.mutate('todo-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: TODO_QUERY_KEY })
  })
})
