import { describe, it, expect } from 'vitest'
import { calcTodoStatus, STATUS_LABEL, STATUS_COLOR } from '../utils/todoStatus'
import type { Todo } from '../types/todo'

const today = new Date().toISOString().split('T')[0]
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
const farFuture = '2099-12-31'
const farPast = '2000-01-01'

const baseTodo: Todo = {
  id: 'todo-1',
  userId: 'user-1',
  categoryId: 'cat-1',
  assigneeId: null,
  title: '테스트',
  description: null,
  startDate: null,
  endDate: null,
  isCompleted: false,
  createdAt: '2026-05-28T00:00:00.000Z',
  updatedAt: '2026-05-28T00:00:00.000Z',
}

describe('calcTodoStatus', () => {
  it('isCompleted=true이면 completed를 반환한다', () => {
    expect(calcTodoStatus({ ...baseTodo, isCompleted: true })).toBe('completed')
  })

  it('startDate 없음, endDate 없음 → pending', () => {
    expect(calcTodoStatus(baseTodo)).toBe('pending')
  })

  it('startDate가 미래 → pending', () => {
    expect(calcTodoStatus({ ...baseTodo, startDate: farFuture })).toBe('pending')
  })

  it('endDate가 과거 → overdue', () => {
    expect(calcTodoStatus({ ...baseTodo, endDate: farPast })).toBe('overdue')
  })

  it('endDate가 어제 → overdue', () => {
    expect(calcTodoStatus({ ...baseTodo, endDate: yesterday })).toBe('overdue')
  })

  it('startDate가 오늘, endDate 없음 → in_progress', () => {
    expect(calcTodoStatus({ ...baseTodo, startDate: today })).toBe('in_progress')
  })

  it('startDate가 오늘, endDate가 오늘 → in_progress', () => {
    expect(calcTodoStatus({ ...baseTodo, startDate: today, endDate: today })).toBe('in_progress')
  })

  it('startDate가 과거, endDate가 미래 → in_progress', () => {
    expect(calcTodoStatus({ ...baseTodo, startDate: farPast, endDate: farFuture })).toBe('in_progress')
  })

  it('isCompleted=true이면 endDate 과거여도 completed를 반환한다', () => {
    expect(calcTodoStatus({ ...baseTodo, isCompleted: true, endDate: farPast })).toBe('completed')
  })

  it('startDate가 내일 → pending', () => {
    expect(calcTodoStatus({ ...baseTodo, startDate: tomorrow })).toBe('pending')
  })
})

describe('STATUS_LABEL', () => {
  it('모든 상태에 레이블이 정의되어 있다', () => {
    expect(STATUS_LABEL.pending).toBe('시작 전')
    expect(STATUS_LABEL.in_progress).toBe('진행 중')
    expect(STATUS_LABEL.overdue).toBe('기한 초과')
    expect(STATUS_LABEL.completed).toBe('완료')
  })
})

describe('STATUS_COLOR', () => {
  it('모든 상태에 색상이 정의되어 있다', () => {
    expect(STATUS_COLOR.pending).toBeTruthy()
    expect(STATUS_COLOR.in_progress).toBeTruthy()
    expect(STATUS_COLOR.overdue).toBeTruthy()
    expect(STATUS_COLOR.completed).toBeTruthy()
  })
})
