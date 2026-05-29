import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Input from '../components/common/Input'

describe('Input', () => {
  it('input 요소를 렌더링한다', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('label을 렌더링한다', () => {
    render(<Input label="이메일" />)
    expect(screen.getByText('이메일')).toBeInTheDocument()
  })

  it('label이 input과 연결된다 (htmlFor)', () => {
    render(<Input label="이메일" />)
    const label = screen.getByText('이메일')
    const input = screen.getByRole('textbox')
    expect(label).toHaveAttribute('for', input.id)
  })

  it('에러 메시지를 렌더링한다', () => {
    render(<Input error="필수 입력 항목입니다." />)
    expect(screen.getByRole('alert')).toHaveTextContent('필수 입력 항목입니다.')
  })

  it('에러가 있을 때 aria-invalid가 true로 설정된다', () => {
    render(<Input error="오류 발생" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('에러가 없을 때 aria-invalid가 false로 설정된다', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false')
  })

  it('에러가 있을 때 inline style에 error 색상 border가 포함된다', () => {
    render(<Input error="오류" />)
    const style = screen.getByRole('textbox').getAttribute('style') ?? ''
    expect(style).toContain('var(--color-error)')
  })

  it('에러가 없을 때 inline style에 default border 색상이 포함된다', () => {
    render(<Input />)
    const style = screen.getByRole('textbox').getAttribute('style') ?? ''
    expect(style).toContain('var(--color-border-default)')
  })

  it('입력값 변경이 동작한다', async () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} />)
    await userEvent.type(screen.getByRole('textbox'), 'hello')
    expect(onChange).toHaveBeenCalled()
  })

  it('password type이 적용된다', () => {
    render(<Input type="password" />)
    expect(document.querySelector('input[type="password"]')).toBeInTheDocument()
  })

  it('placeholder가 렌더링된다', () => {
    render(<Input placeholder="이메일을 입력하세요" />)
    expect(screen.getByPlaceholderText('이메일을 입력하세요')).toBeInTheDocument()
  })
})
