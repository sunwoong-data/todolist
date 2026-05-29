import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  id?: string
}

function Input({ label, error, id, style, onFocus, onBlur, ...rest }: InputProps) {
  const inputId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined)
  const [isFocused, setIsFocused] = useState(false)

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'var(--color-bg-elevated)',
    color: 'var(--color-text-primary)',
    border: `1.5px solid ${error ? 'var(--color-error)' : isFocused ? 'var(--color-border-focus)' : 'var(--color-border-default)'}`,
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-3) var(--space-4)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9375rem',
    lineHeight: 1.5,
    outline: 'none',
    minHeight: '44px',
    transition: 'border-color var(--transition-normal), box-shadow var(--transition-normal)',
    boxShadow: isFocused
      ? `var(--shadow-inset), 0 0 0 3px rgba(245, 214, 26, 0.2)`
      : 'var(--shadow-inset)',
    ...style,
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.8125rem',
    fontWeight: 600,
    letterSpacing: '0',
    textTransform: 'none',
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-2)',
    display: 'block',
  }

  const errorStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.75rem',
    color: 'var(--color-error)',
    marginTop: 'var(--space-1)',
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    setIsFocused(true)
    onFocus?.(e)
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    setIsFocused(false)
    onBlur?.(e)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={inputStyle}
        aria-invalid={!!error}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />
      {error && (
        <span id={inputId ? `${inputId}-error` : undefined} role="alert" style={errorStyle}>
          {error}
        </span>
      )}
    </div>
  )
}

export default Input
