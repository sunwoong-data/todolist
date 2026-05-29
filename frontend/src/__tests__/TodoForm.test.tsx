import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import TodoForm from '../components/todo/TodoForm'
import * as categoryApiModule from '../api/categoryApi'

vi.mock('../api/categoryApi', () => ({
  categoryApi: {
    getCategories: vi.fn(),
    createCategory: vi.fn(),
  },
}))

const mockCategories = [
  { id: 'cat-1', userId: 'user-1', name: '기본', isDefault: true },
  { id: 'cat-2', userId: 'user-1', name: '업무', isDefault: false },
]

function renderForm(props: Partial<Parameters<typeof TodoForm>[0]> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 0 } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TodoForm
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
          isLoading={false}
          {...props}
        />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('TodoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(categoryApiModule.categoryApi.getCategories).mockResolvedValue(mockCategories)
  })

  it('제목, 설명, 카테고리, 시작일, 종료일 입력 필드가 렌더링된다', () => {
    renderForm()
    expect(screen.getByLabelText(/제목/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/설명/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/카테고리/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/시작일/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/종료일/i)).toBeInTheDocument()
  })

  it('기본 제출 레이블은 "등록"이다', () => {
    renderForm()
    expect(screen.getByRole('button', { name: '등록' })).toBeInTheDocument()
  })

  it('submitLabel prop이 적용된다', () => {
    renderForm({ submitLabel: '저장' })
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument()
  })

  it('취소 버튼 클릭 시 onCancel이 호출된다', async () => {
    const onCancel = vi.fn()
    renderForm({ onCancel })
    await userEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('제목 없이 제출 시 에러 메시지가 표시된다', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: '등록' }))
    expect(screen.getByRole('alert')).toHaveTextContent('필수 입력 항목입니다.')
  })

  it('제목 없이 제출 시 onSubmit이 호출되지 않는다', async () => {
    const onSubmit = vi.fn()
    renderForm({ onSubmit })
    await userEvent.click(screen.getByRole('button', { name: '등록' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('종료일 < 시작일이면 에러 메시지가 표시된다 (BR-06)', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText(/제목/i), '테스트')
    await userEvent.type(screen.getByLabelText(/시작일/i), '2026-06-10')
    await userEvent.type(screen.getByLabelText(/종료일/i), '2026-06-01')
    await userEvent.click(screen.getByRole('button', { name: '등록' }))
    expect(screen.getByRole('alert')).toHaveTextContent('종료일은 시작일보다 이전일 수 없습니다.')
  })

  it('종료일 < 시작일이면 onSubmit이 호출되지 않는다', async () => {
    const onSubmit = vi.fn()
    renderForm({ onSubmit })
    await userEvent.type(screen.getByLabelText(/제목/i), '테스트')
    await userEvent.type(screen.getByLabelText(/시작일/i), '2026-06-10')
    await userEvent.type(screen.getByLabelText(/종료일/i), '2026-06-01')
    await userEvent.click(screen.getByRole('button', { name: '등록' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('유효한 입력 후 제출 시 onSubmit이 올바른 데이터로 호출된다', async () => {
    const onSubmit = vi.fn()
    renderForm({ onSubmit })
    await userEvent.type(screen.getByLabelText(/제목/i), '리액트 공부')
    await userEvent.click(screen.getByRole('button', { name: '등록' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: '리액트 공부' }))
  })

  it('initialValues가 폼 필드에 설정된다', () => {
    renderForm({
      initialValues: { title: '기존 제목', description: '기존 설명', startDate: '2026-06-01', endDate: '2026-06-30' },
    })
    expect(screen.getByLabelText(/제목/i)).toHaveValue('기존 제목')
    expect(screen.getByLabelText(/설명/i)).toHaveValue('기존 설명')
  })

  it('카테고리 목록이 select에 렌더링된다', async () => {
    renderForm()
    expect(await screen.findByRole('option', { name: '기본' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '업무' })).toBeInTheDocument()
  })

  it('isLoading=true이면 제출 버튼이 비활성화된다', () => {
    renderForm({ isLoading: true })
    expect(screen.getByRole('button', { name: '등록' })).toBeDisabled()
  })
})
