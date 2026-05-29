import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { useGetCategories, useCreateCategory, CATEGORY_QUERY_KEY } from '../hooks/useCategories'
import * as categoryApiModule from '../api/categoryApi'
import type { Category } from '../types/category'

vi.mock('../api/categoryApi', () => ({
  categoryApi: {
    getCategories: vi.fn(),
    createCategory: vi.fn(),
  },
}))

const mockCategory: Category = {
  id: 'cat-1',
  userId: 'user-1',
  name: '기본',
  isDefault: true,
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } },
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useGetCategories', () => {
  beforeEach(() => vi.clearAllMocks())

  it('카테고리 목록을 조회한다', async () => {
    vi.mocked(categoryApiModule.categoryApi.getCategories).mockResolvedValueOnce([mockCategory])
    const { result } = renderHook(() => useGetCategories(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockCategory])
  })

  it('API 에러 시 isError가 true가 된다', async () => {
    vi.mocked(categoryApiModule.categoryApi.getCategories).mockRejectedValueOnce(new Error('Network Error'))
    const { result } = renderHook(() => useGetCategories(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('쿼리 키가 올바르게 설정된다', async () => {
    vi.mocked(categoryApiModule.categoryApi.getCategories).mockResolvedValueOnce([])

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 0 } } })
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useGetCategories(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cachedData = queryClient.getQueryData(CATEGORY_QUERY_KEY)
    expect(cachedData).toEqual([])
  })
})

describe('useCreateCategory', () => {
  beforeEach(() => vi.clearAllMocks())

  it('카테고리를 생성한다', async () => {
    const newCategory = { ...mockCategory, id: 'cat-2', name: '업무', isDefault: false }
    vi.mocked(categoryApiModule.categoryApi.createCategory).mockResolvedValueOnce(newCategory)

    const { result } = renderHook(() => useCreateCategory(), { wrapper: createWrapper() })
    result.current.mutate({ name: '업무' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(categoryApiModule.categoryApi.createCategory).toHaveBeenCalledWith({ name: '업무' })
  })

  it('생성 성공 시 categories 쿼리를 무효화한다', async () => {
    const newCategory = { ...mockCategory, id: 'cat-2', name: '공부', isDefault: false }
    vi.mocked(categoryApiModule.categoryApi.createCategory).mockResolvedValueOnce(newCategory)

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } } })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useCreateCategory(), { wrapper })
    result.current.mutate({ name: '공부' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: CATEGORY_QUERY_KEY })
  })

  it('생성 실패 시 isError가 true가 된다', async () => {
    vi.mocked(categoryApiModule.categoryApi.createCategory).mockRejectedValueOnce(
      new Error('중복 이름')
    )

    const { result } = renderHook(() => useCreateCategory(), { wrapper: createWrapper() })
    result.current.mutate({ name: '기본' })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
