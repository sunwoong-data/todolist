import apiClient from './client'
import type { Category, CreateCategoryRequest } from '../types/category'

export const categoryApi = {
  getCategories: () =>
    apiClient.get<{ categories: Category[] }>('/api/categories').then((r) => r.data.categories),

  createCategory: (data: CreateCategoryRequest) =>
    apiClient.post<{ category: Category }>('/api/categories', data).then((r) => r.data.category),
}
