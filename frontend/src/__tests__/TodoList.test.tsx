import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import TodoList from '../components/todo/TodoList'
import type { Todo } from '../types/todo'

const mockTodos: Todo[] = [
  {
    id: 'todo-1', userId: 'user-1', categoryId: 'cat-1', assigneeId: null,
    title: '할 일 1', description: null, startDate: null, endDate: null,
    isCompleted: false, createdAt: '2026-05-28T00:00:00.000Z', updatedAt: '2026-05-28T00:00:00.000Z',
  },
  {
    id: 'todo-2', userId: 'user-1', categoryId: 'cat-1', assigneeId: null,
    title: '할 일 2', description: null, startDate: null, endDate: null,
    isCompleted: true, createdAt: '2026-05-28T00:00:00.000Z', updatedAt: '2026-05-28T00:00:00.000Z',
  },
]

function renderList(props: Partial<Parameters<typeof TodoList>[0]> = {}) {
  const onComplete = vi.fn()
  const onDelete = vi.fn()
  render(
    <MemoryRouter>
      <TodoList
        todos={[]}
        isLoading={false}
        isError={false}
        onComplete={onComplete}
        onDelete={onDelete}
        {...props}
      />
    </MemoryRouter>
  )
  return { onComplete, onDelete }
}

describe('TodoList', () => {
  it('로딩 중 스켈레톤 카드가 표시된다', () => {
    renderList({ isLoading: true })
    expect(screen.getByLabelText('로딩 중')).toBeInTheDocument()
  })

  it('에러 상태에서 에러 메시지가 표시된다', () => {
    renderList({ isError: true })
    expect(screen.getByRole('alert')).toHaveTextContent('목록을 불러오지 못했습니다')
  })

  it('에러 상태에서 새로고침 버튼이 표시된다', () => {
    renderList({ isError: true, onRetry: vi.fn() })
    expect(screen.getByText('새로고침')).toBeInTheDocument()
  })

  it('새로고침 버튼 클릭 시 onRetry가 호출된다', async () => {
    const onRetry = vi.fn()
    renderList({ isError: true, onRetry })
    await userEvent.click(screen.getByText('새로고침'))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('빈 목록 상태에서 빈 상태 메시지가 표시된다', () => {
    renderList({ todos: [] })
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('Todo 목록이 렌더링된다', () => {
    renderList({ todos: mockTodos })
    expect(screen.getByTestId('todo-item-todo-1')).toBeInTheDocument()
    expect(screen.getByTestId('todo-item-todo-2')).toBeInTheDocument()
  })

  it('카테고리명이 각 TodoItem에 전달된다', () => {
    renderList({
      todos: mockTodos,
      categories: [{ id: 'cat-1', userId: 'user-1', name: '기본', isDefault: true }],
    })
    const metas = screen.getAllByTestId('todo-meta')
    expect(metas.some((el) => el.textContent?.includes('기본'))).toBe(true)
  })

  it('onComplete 콜백이 TodoItem으로 전달된다', async () => {
    const onComplete = vi.fn()
    renderList({ todos: [mockTodos[0]], onComplete, onDelete: vi.fn() })
    await userEvent.click(screen.getByTestId('complete-button'))
    expect(onComplete).toHaveBeenCalledWith('todo-1')
  })
})
