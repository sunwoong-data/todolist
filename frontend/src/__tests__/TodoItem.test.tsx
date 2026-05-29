import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import TodoItem from '../components/todo/TodoItem'
import type { Todo } from '../types/todo'

const baseTodo: Todo = {
  id: 'todo-1',
  userId: 'user-1',
  categoryId: 'cat-1',
  assigneeId: null,
  title: '리액트 공부하기',
  description: null,
  startDate: null,
  endDate: null,
  isCompleted: false,
  createdAt: '2026-05-28T00:00:00.000Z',
  updatedAt: '2026-05-28T00:00:00.000Z',
}

function renderItem(todo: Partial<Todo> = {}, extraProps: Record<string, unknown> = {}) {
  const onComplete = vi.fn()
  const onDelete = vi.fn()
  render(
    <MemoryRouter>
      <TodoItem
        todo={{ ...baseTodo, ...todo }}
        onComplete={onComplete}
        onDelete={onDelete}
        {...extraProps}
      />
    </MemoryRouter>
  )
  return { onComplete, onDelete }
}

describe('TodoItem', () => {
  it('제목이 렌더링된다', () => {
    renderItem()
    expect(screen.getByTestId('todo-title')).toHaveTextContent('리액트 공부하기')
  })

  it('상태 뱃지가 렌더링된다', () => {
    renderItem()
    expect(screen.getByTestId('todo-status-badge')).toBeInTheDocument()
  })

  it('startDate 없음 → "시작 전" 뱃지 표시', () => {
    renderItem()
    expect(screen.getByTestId('todo-status-badge')).toHaveTextContent('시작 전')
  })

  it('진행 중 상태 뱃지 표시 (startDate=과거, endDate=미래)', () => {
    renderItem({ startDate: '2000-01-01', endDate: '2099-12-31' })
    expect(screen.getByTestId('todo-status-badge')).toHaveTextContent('진행 중')
  })

  it('완료 상태 뱃지 표시', () => {
    renderItem({ isCompleted: true })
    expect(screen.getByTestId('todo-status-badge')).toHaveTextContent('완료')
  })

  it('기한 초과 뱃지 표시 (endDate=과거)', () => {
    renderItem({ endDate: '2000-01-01' })
    expect(screen.getByTestId('todo-status-badge')).toHaveTextContent('기한 초과')
  })

  it('카테고리명이 메타 영역에 표시된다', () => {
    const onComplete = vi.fn()
    const onDelete = vi.fn()
    render(
      <MemoryRouter>
        <TodoItem todo={baseTodo} categoryName="공부" onComplete={onComplete} onDelete={onDelete} />
      </MemoryRouter>
    )
    expect(screen.getByTestId('todo-meta')).toHaveTextContent('공부')
  })

  it('날짜 범위가 메타 영역에 표시된다', () => {
    renderItem({ startDate: '2026-06-01', endDate: '2026-06-30' })
    expect(screen.getByTestId('todo-meta')).toHaveTextContent('2026-06-01 ~ 2026-06-30')
  })

  it('수정 링크가 올바른 경로로 렌더링된다', () => {
    renderItem()
    expect(screen.getByTestId('edit-link')).toHaveAttribute('href', '/todos/todo-1/edit')
  })

  it('완료되지 않은 todo에는 완료 버튼이 표시된다', () => {
    renderItem()
    expect(screen.getByTestId('complete-button')).toBeInTheDocument()
  })

  it('이미 완료된 todo에는 완료 버튼이 없다', () => {
    renderItem({ isCompleted: true })
    expect(screen.queryByTestId('complete-button')).not.toBeInTheDocument()
  })

  it('완료 버튼 클릭 시 onComplete가 호출된다', async () => {
    const { onComplete } = renderItem()
    await userEvent.click(screen.getByTestId('complete-button'))
    expect(onComplete).toHaveBeenCalledWith('todo-1')
  })

  it('삭제 버튼 클릭 시 삭제 확인 모달이 열린다', async () => {
    renderItem()
    await userEvent.click(screen.getByTestId('delete-button'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('모달의 삭제 확인 버튼 클릭 시 onDelete가 호출된다', async () => {
    const { onDelete } = renderItem()
    await userEvent.click(screen.getByTestId('delete-button'))
    const dialog = screen.getByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: /삭제/ }))
    expect(onDelete).toHaveBeenCalledWith('todo-1')
  })

  it('모달의 취소 버튼 클릭 시 모달이 닫힌다', async () => {
    renderItem()
    await userEvent.click(screen.getByTestId('delete-button'))
    await userEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('등록일이 표시된다', () => {
    renderItem()
    expect(screen.getByTestId('todo-created-at')).toBeInTheDocument()
  })

  it('수정일이 등록일과 다를 때 표시된다', () => {
    renderItem({ createdAt: '2026-05-28T00:00:00.000Z', updatedAt: '2026-05-29T00:00:00.000Z' })
    expect(screen.getByTestId('todo-updated-at')).toBeInTheDocument()
  })

  it('수정일이 등록일과 같을 때 수정일이 표시되지 않는다', () => {
    renderItem({ createdAt: '2026-05-28T00:00:00.000Z', updatedAt: '2026-05-28T00:00:00.000Z' })
    expect(screen.queryByTestId('todo-updated-at')).not.toBeInTheDocument()
  })
})
