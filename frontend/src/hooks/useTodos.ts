import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { todoApi } from '../api/todoApi'
import type { Todo, TodoFilter, CreateTodoRequest, UpdateTodoRequest } from '../types/todo'
import type { ApiError } from '../types/api'

export const TODO_QUERY_KEY = ['todos'] as const

export function useGetTodos(filter?: TodoFilter) {
  return useQuery<Todo[], AxiosError<ApiError>>({
    queryKey: [...TODO_QUERY_KEY, filter],
    queryFn: () => todoApi.getTodos(filter),
  })
}

export function useGetTodo(id: string) {
  return useQuery<Todo, AxiosError<ApiError>>({
    queryKey: [...TODO_QUERY_KEY, id],
    queryFn: () => todoApi.getTodo(id),
    enabled: !!id,
  })
}

export function useCreateTodo() {
  const queryClient = useQueryClient()
  return useMutation<Todo, AxiosError<ApiError>, CreateTodoRequest>({
    mutationFn: (data) => todoApi.createTodo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODO_QUERY_KEY })
    },
  })
}

export function useUpdateTodo() {
  const queryClient = useQueryClient()
  return useMutation<Todo, AxiosError<ApiError>, { id: string; data: UpdateTodoRequest }>({
    mutationFn: ({ id, data }) => todoApi.updateTodo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODO_QUERY_KEY })
    },
  })
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()
  return useMutation<{ message: string }, AxiosError<ApiError>, string>({
    mutationFn: (id) => todoApi.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODO_QUERY_KEY })
    },
  })
}

export function useCompleteTodo() {
  const queryClient = useQueryClient()
  return useMutation<Todo, AxiosError<ApiError>, string>({
    mutationFn: (id) => todoApi.completeTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODO_QUERY_KEY })
    },
  })
}
