import type { Todo, TodoStatus } from '../types/todo'

export function calcTodoStatus(todo: Todo): TodoStatus {
  if (todo.isCompleted) return 'completed'

  // YYYY-MM-DD 문자열 비교 (시간대 독립적)
  const todayStr = new Date().toISOString().split('T')[0]

  if (todo.endDate && todo.endDate < todayStr) return 'overdue'
  if (todo.startDate && todo.startDate <= todayStr) return 'in_progress'

  return 'pending'
}

export const STATUS_LABEL: Record<TodoStatus, string> = {
  pending: '시작 전',
  in_progress: '진행 중',
  overdue: '기한 초과',
  completed: '완료',
}

export const STATUS_COLOR: Record<TodoStatus, string> = {
  pending: 'var(--color-status-pending)',
  in_progress: 'var(--color-status-in-progress)',
  overdue: 'var(--color-status-overdue)',
  completed: 'var(--color-status-completed)',
}
