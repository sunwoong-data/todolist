import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CategoryFilter from '../components/category/CategoryFilter'
import { useFilterStore } from '../store/filterStore'
import * as categoryApiModule from '../api/categoryApi'
import * as assigneeApiModule from '../api/assigneeApi'
import type { Category } from '../types/category'

vi.mock('../api/categoryApi', () => ({
  categoryApi: {
    getCategories: vi.fn(),
    createCategory: vi.fn(),
  },
}))
vi.mock('../api/assigneeApi', () => ({
  assigneeApi: {
    getAssignees: vi.fn(),
    createAssignee: vi.fn(),
    deleteAssignee: vi.fn(),
  },
}))

const mockCategories: Category[] = [
  { id: 'cat-1', userId: 'user-1', name: '기본', isDefault: true },
  { id: 'cat-2', userId: 'user-1', name: '업무', isDefault: false },
  { id: 'cat-3', userId: 'user-1', name: '공부', isDefault: false },
]

function renderFilter() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <CategoryFilter />
    </QueryClientProvider>
  )
}

describe('CategoryFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useFilterStore.setState({ status: null, categoryId: null, assigneeId: null, viewMode: 'list' })
    vi.mocked(categoryApiModule.categoryApi.getCategories).mockResolvedValue(mockCategories)
    vi.mocked(assigneeApiModule.assigneeApi.getAssignees).mockResolvedValue([])
  })

  it('상태 필터 옵션 5개가 렌더링된다', async () => {
    renderFilter()
    expect(await screen.findByTestId('status-filter-all')).toBeInTheDocument()
    expect(screen.getByTestId('status-filter-pending')).toBeInTheDocument()
    expect(screen.getByTestId('status-filter-in_progress')).toBeInTheDocument()
    expect(screen.getByTestId('status-filter-completed')).toBeInTheDocument()
    expect(screen.getByTestId('status-filter-overdue')).toBeInTheDocument()
  })

  it('카테고리 목록이 로드된 후 렌더링된다', async () => {
    renderFilter()
    expect(await screen.findByTestId('category-filter-cat-1')).toBeInTheDocument()
    expect(screen.getByTestId('category-filter-cat-2')).toBeInTheDocument()
    expect(screen.getByTestId('category-filter-cat-3')).toBeInTheDocument()
  })

  it('카테고리 전체 옵션이 렌더링된다', async () => {
    renderFilter()
    expect(await screen.findByTestId('category-filter-all')).toBeInTheDocument()
  })

  it('기본 상태에서 "전체" 상태 필터가 active(aria-pressed=true)다', async () => {
    renderFilter()
    const allBtn = await screen.findByTestId('status-filter-all')
    expect(allBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('상태 필터 클릭 시 filterStore.status가 업데이트된다', async () => {
    renderFilter()
    const pendingBtn = await screen.findByTestId('status-filter-pending')
    await userEvent.click(pendingBtn)
    expect(useFilterStore.getState().status).toBe('pending')
  })

  it('"진행 중" 상태 필터 클릭 시 in_progress로 설정된다', async () => {
    renderFilter()
    const inProgressBtn = await screen.findByTestId('status-filter-in_progress')
    await userEvent.click(inProgressBtn)
    expect(useFilterStore.getState().status).toBe('in_progress')
  })

  it('"완료" 상태 필터 클릭 시 completed로 설정된다', async () => {
    renderFilter()
    await userEvent.click(await screen.findByTestId('status-filter-completed'))
    expect(useFilterStore.getState().status).toBe('completed')
  })

  it('"기한 초과" 상태 필터 클릭 시 overdue로 설정된다', async () => {
    renderFilter()
    await userEvent.click(await screen.findByTestId('status-filter-overdue'))
    expect(useFilterStore.getState().status).toBe('overdue')
  })

  it('"전체" 상태 필터 클릭 시 status가 null로 초기화된다', async () => {
    useFilterStore.setState({ status: 'pending', categoryId: null })
    renderFilter()
    await userEvent.click(await screen.findByTestId('status-filter-all'))
    expect(useFilterStore.getState().status).toBeNull()
  })

  it('카테고리 클릭 시 filterStore.categoryId가 업데이트된다', async () => {
    renderFilter()
    await userEvent.click(await screen.findByTestId('category-filter-cat-2'))
    expect(useFilterStore.getState().categoryId).toBe('cat-2')
  })

  it('"전체" 카테고리 클릭 시 categoryId가 null로 초기화된다', async () => {
    useFilterStore.setState({ status: null, categoryId: 'cat-2' })
    renderFilter()
    await userEvent.click(await screen.findByTestId('category-filter-all'))
    expect(useFilterStore.getState().categoryId).toBeNull()
  })

  it('선택된 상태 필터가 aria-pressed=true다', async () => {
    useFilterStore.setState({ status: 'in_progress', categoryId: null })
    renderFilter()
    const btn = await screen.findByTestId('status-filter-in_progress')
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })

  it('선택된 카테고리 필터가 aria-pressed=true다', async () => {
    useFilterStore.setState({ status: null, categoryId: 'cat-1' })
    renderFilter()
    const btn = await screen.findByTestId('category-filter-cat-1')
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })

  it('카테고리 로딩 중 로딩 표시가 렌더링된다', async () => {
    vi.mocked(categoryApiModule.categoryApi.getCategories).mockImplementation(
      () => new Promise(() => {})
    )
    renderFilter()
    expect(await screen.findByLabelText('로딩 중')).toBeInTheDocument()
  })
})
