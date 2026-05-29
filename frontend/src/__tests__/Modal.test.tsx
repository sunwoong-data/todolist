import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Modal from '../components/common/Modal'

const defaultProps = {
  isOpen: true,
  title: '삭제 확인',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
}

describe('Modal', () => {
  it('isOpen=true일 때 모달이 렌더링된다', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('isOpen=false일 때 모달이 렌더링되지 않는다', () => {
    render(<Modal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('title이 렌더링된다', () => {
    render(<Modal {...defaultProps} title="정말 삭제하시겠습니까?" />)
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument()
  })

  it('children이 렌더링된다', () => {
    render(<Modal {...defaultProps}><p>삭제하면 복구할 수 없습니다.</p></Modal>)
    expect(screen.getByText('삭제하면 복구할 수 없습니다.')).toBeInTheDocument()
  })

  it('기본 확인/취소 레이블이 렌더링된다', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
  })

  it('커스텀 confirmLabel, cancelLabel이 적용된다', () => {
    render(<Modal {...defaultProps} confirmLabel="삭제" cancelLabel="돌아가기" />)
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '돌아가기' })).toBeInTheDocument()
  })

  it('확인 버튼 클릭 시 onConfirm이 호출된다', async () => {
    const onConfirm = vi.fn()
    render(<Modal {...defaultProps} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: '확인' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('취소 버튼 클릭 시 onCancel이 호출된다', async () => {
    const onCancel = vi.fn()
    render(<Modal {...defaultProps} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('backdrop 클릭 시 onCancel이 호출된다', async () => {
    const onCancel = vi.fn()
    render(<Modal {...defaultProps} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('dialog'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('모달 내부 클릭 시 onCancel이 호출되지 않는다', async () => {
    const onCancel = vi.fn()
    render(<Modal {...defaultProps} onCancel={onCancel} title="내부 클릭 테스트" />)
    await userEvent.click(screen.getByText('내부 클릭 테스트'))
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('Escape 키 입력 시 onCancel이 호출된다', async () => {
    const onCancel = vi.fn()
    render(<Modal {...defaultProps} onCancel={onCancel} />)
    await userEvent.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('isLoading=true일 때 확인 버튼이 로딩 상태다', () => {
    render(<Modal {...defaultProps} isLoading={true} />)
    const confirmBtn = screen.getByRole('button', { name: /확인/ })
    expect(confirmBtn).toBeDisabled()
    expect(confirmBtn).toHaveAttribute('aria-busy', 'true')
  })

  it('aria-modal 속성이 설정된다', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })
})
