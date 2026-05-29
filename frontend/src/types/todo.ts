export type TodoStatus = 'pending' | 'in_progress' | 'overdue' | 'completed'

export interface Todo {
  id: string
  userId: string
  categoryId: string
  assigneeId: string | null
  title: string
  description: string | null
  startDate: string | null
  endDate: string | null
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTodoRequest {
  title: string
  description?: string
  categoryId?: string
  assigneeId?: string
  startDate?: string
  endDate?: string
}

export interface UpdateTodoRequest {
  title?: string
  description?: string
  categoryId?: string
  assigneeId?: string | null
  startDate?: string
  endDate?: string
}

export interface TodoFilter {
  status?: TodoStatus
  categoryId?: string
  assigneeId?: string
}
