import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { assigneeApi } from '../api/assigneeApi'
import type { Assignee, CreateAssigneeRequest } from '../types/assignee'
import type { ApiError } from '../types/api'

export const ASSIGNEE_QUERY_KEY = ['assignees'] as const

export function useGetAssignees() {
  return useQuery<Assignee[], AxiosError<ApiError>>({
    queryKey: ASSIGNEE_QUERY_KEY,
    queryFn: () => assigneeApi.getAssignees(),
  })
}

export function useCreateAssignee() {
  const queryClient = useQueryClient()
  return useMutation<Assignee, AxiosError<ApiError>, CreateAssigneeRequest>({
    mutationFn: (data) => assigneeApi.createAssignee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNEE_QUERY_KEY })
    },
  })
}

export function useDeleteAssignee() {
  const queryClient = useQueryClient()
  return useMutation<{ message: string }, AxiosError<ApiError>, string>({
    mutationFn: (id) => assigneeApi.deleteAssignee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNEE_QUERY_KEY })
    },
  })
}
