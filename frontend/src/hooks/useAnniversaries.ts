import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { anniversaryApi } from '../api/anniversaryApi'
import type { Anniversary, CreateAnniversaryRequest } from '../types/anniversary'
import type { ApiError } from '../types/api'

export const ANNIVERSARY_QUERY_KEY = ['anniversaries'] as const

export function useGetAnniversaries() {
  return useQuery<Anniversary[], AxiosError<ApiError>>({
    queryKey: ANNIVERSARY_QUERY_KEY,
    queryFn: () => anniversaryApi.getAnniversaries(),
  })
}

export function useCreateAnniversary() {
  const queryClient = useQueryClient()
  return useMutation<Anniversary, AxiosError<ApiError>, CreateAnniversaryRequest>({
    mutationFn: (data) => anniversaryApi.createAnniversary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANNIVERSARY_QUERY_KEY })
    },
  })
}

export function useDeleteAnniversary() {
  const queryClient = useQueryClient()
  return useMutation<{ message: string }, AxiosError<ApiError>, string>({
    mutationFn: (id) => anniversaryApi.deleteAnniversary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANNIVERSARY_QUERY_KEY })
    },
  })
}
