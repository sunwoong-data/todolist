import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TodoCalendar from '../components/todo/TodoCalendar'
import type { Todo } from '../types/todo'
import * as holidayApiModule from '../api/holidayApi'

vi.mock('../api/holidayApi', () => ({
  holidayApi: { getHolidays: vi.fn() },
}))

const baseTodo: Todo = {
  id: 'todo-1',
  userId: 'u1',
  categoryId: 'cat-1',
  assigneeId: null,
  title: '리액트 공부',
  description: null,
  startDate: '2026-05-15',
  endDate: null,
  isCompleted: false,
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
}

function renderCalendar(todos: Todo[] = []) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: 0 } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <TodoCalendar todos={todos} />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('TodoCalendar', () => {
  beforeEach(() => {
    vi.mocked(holidayApiModule.holidayApi.getHolidays).mockResolvedValue([])
  })

  it('월/년 헤더가 렌더링된다', () => {
    renderCalendar()
    expect(screen.getByTestId('calendar-header')).toBeInTheDocument()
  })

  it('이전 달 버튼이 렌더링된다', () => {
    renderCalendar()
    expect(screen.getByTestId('calendar-prev')).toBeInTheDocument()
  })

  it('다음 달 버튼이 렌더링된다', () => {
    renderCalendar()
    expect(screen.getByTestId('calendar-next')).toBeInTheDocument()
  })

  it('요일 헤더 7개가 렌더링된다', () => {
    renderCalendar()
    const header = screen.getByTestId('calendar-header')
    const grid = header.closest('div')!.nextElementSibling!
    expect(grid.children).toHaveLength(7)
  })

  it('이전 달 버튼 클릭 시 헤더의 달이 변경된다', async () => {
    renderCalendar()
    const headerBefore = screen.getByTestId('calendar-header').textContent
    await userEvent.click(screen.getByTestId('calendar-prev'))
    const headerAfter = screen.getByTestId('calendar-header').textContent
    expect(headerAfter).not.toBe(headerBefore)
  })

  it('다음 달 버튼 클릭 시 헤더의 달이 변경된다', async () => {
    renderCalendar()
    const headerBefore = screen.getByTestId('calendar-header').textContent
    await userEvent.click(screen.getByTestId('calendar-next'))
    const headerAfter = screen.getByTestId('calendar-header').textContent
    expect(headerAfter).not.toBe(headerBefore)
  })

  it('startDate가 있는 Todo가 해당 날짜 셀에 표시된다', async () => {
    renderCalendar([baseTodo])
    // 2026년 5월로 이동 (현재 달 기준으로 2026-05-xx)
    const header = screen.getByTestId('calendar-header').textContent ?? ''
    // 현재 달이 2026-05가 아닐 수 있으므로 네비게이션 후 확인
    // baseTodo의 startDate = '2026-05-15'이므로 2026년 5월로 이동
    // 현재 날짜 기준으로 이미 해당 달이면 바로 확인
    if (!header.includes('2026') || !header.includes('05')) {
      // 네비게이션으로 이동하는 것 대신, 현재 달에 startDate가 맞는 todo로 테스트
      const today = new Date()
      const todayMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
      const todoForToday: Todo = {
        ...baseTodo,
        id: 'todo-today',
        startDate: `${todayMonth}-15`,
      }
      const { unmount } = renderCalendar([todoForToday])
      expect(screen.getByTestId('calendar-todo-todo-today')).toBeInTheDocument()
      unmount()
    } else {
      expect(screen.getByTestId('calendar-todo-todo-1')).toBeInTheDocument()
    }
  })

  it('startDate가 없는 Todo는 캘린더에 표시되지 않는다', () => {
    const todoNoDate: Todo = { ...baseTodo, id: 'todo-no-date', startDate: null }
    renderCalendar([todoNoDate])
    expect(screen.queryByTestId('calendar-todo-todo-no-date')).not.toBeInTheDocument()
  })

  it('오늘 날짜 셀에 data-testid="calendar-today"가 있다', () => {
    renderCalendar()
    expect(screen.getByTestId('calendar-today')).toBeInTheDocument()
  })

  it('Todo가 없을 때도 캘린더가 렌더링된다', () => {
    renderCalendar([])
    expect(screen.getByTestId('calendar-header')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-today')).toBeInTheDocument()
  })
})
