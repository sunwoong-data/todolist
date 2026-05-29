import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Button from '../components/common/Button'

describe('Button', () => {
  it('children 텍스트를 렌더링한다', () => {
    render(<Button>저장</Button>)
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument()
  })

  it('기본 variant는 primary다', () => {
    render(<Button>확인</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveStyle({ backgroundColor: 'var(--color-accent)' })
  })

  it('secondary variant가 적용된다', () => {
    render(<Button variant="secondary">취소</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveStyle({ color: 'var(--color-text-primary)' })
  })

  it('danger variant가 적용된다', () => {
    render(<Button variant="danger">삭제</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveStyle({ color: 'var(--color-error)' })
  })

  it('disabled 상태에서 클릭 핸들러가 호출되지 않는다', async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>버튼</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('isLoading=true일 때 버튼이 비활성화된다', () => {
    render(<Button isLoading>저장 중</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('isLoading=true일 때 aria-busy가 설정되고 스피너 span이 렌더링된다', () => {
    render(<Button isLoading>저장 중</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(btn.querySelector('span[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('클릭 핸들러가 호출된다', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>클릭</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('sm 사이즈가 적용된다', () => {
    render(<Button size="sm">작은 버튼</Button>)
    expect(screen.getByRole('button')).toHaveStyle({ fontSize: '0.8125rem' })
  })

  it('lg 사이즈가 적용된다', () => {
    render(<Button size="lg">큰 버튼</Button>)
    expect(screen.getByRole('button')).toHaveStyle({ fontSize: '1rem' })
  })
})
