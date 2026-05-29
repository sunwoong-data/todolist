import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { categoryApi } from '../api/categoryApi'
import type { Category, CreateCategoryRequest } from '../types/category'
import type { ApiError } from '../types/api'

export const CATEGORY_QUERY_KEY = ['categories'] as const

export function useGetCategories() {
  return useQuery<Category[], AxiosError<ApiError>>({
    queryKey: CATEGORY_QUERY_KEY,
    queryFn: () => categoryApi.getCategories(),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation<Category, AxiosError<ApiError>, CreateCategoryRequest>({
    mutationFn: (data) => categoryApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY })
    },
  })
}
