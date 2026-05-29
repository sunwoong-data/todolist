import apiClient from './client'
import type { Todo, CreateTodoRequest, UpdateTodoRequest, TodoFilter } from '../types/todo'

export const todoApi = {
  getTodos: (filter?: TodoFilter) => {
    const params: Record<string, string> = {}
    if (filter?.status) params.status = filter.status
    if (filter?.categoryId) params.category_id = filter.categoryId
    if (filter?.assigneeId) params.assignee_id = filter.assigneeId
    return apiClient.get<{ todos: Todo[] }>('/api/todos', { params }).then((r) => r.data.todos)
  },

  getTodo: (id: string) =>
    apiClient.get<{ todo: Todo }>(`/api/todos/${id}`).then((r) => r.data.todo),

  createTodo: (data: CreateTodoRequest) =>
    apiClient.post<{ todo: Todo }>('/api/todos', data).then((r) => r.data.todo),

  updateTodo: (id: string, data: UpdateTodoRequest) =>
    apiClient.patch<{ todo: Todo }>(`/api/todos/${id}`, data).then((r) => r.data.todo),

  deleteTodo: (id: string) =>
    apiClient.delete<{ message: string }>(`/api/todos/${id}`).then((r) => r.data),

  completeTodo: (id: string) =>
    apiClient.patch<{ todo: Todo }>(`/api/todos/${id}/complete`).then((r) => r.data.todo),
}
