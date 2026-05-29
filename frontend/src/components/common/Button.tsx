import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
  children: ReactNode
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-text-inverse)',
    borderColor: 'var(--color-accent)',
    boxShadow: '0 1px 3px rgba(26,115,232,0.3), 0 2px 8px rgba(26,115,232,0.2)',
  },
  secondary: {
    backgroundColor: 'transparent',
    color: 'var(--color-text-primary)',
    borderColor: 'var(--color-border-strong)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    borderColor: 'transparent',
  },
  danger: {
    backgroundColor: 'transparent',
    color: 'var(--color-error)',
    borderColor: 'var(--color-error)',
  },
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: 'var(--space-2) var(--space-4)', fontSize: '0.8125rem', minHeight: '32px' },
  md: { padding: '10px var(--space-5)', fontSize: '0.875rem', minHeight: '44px' },
  lg: { padding: 'var(--space-4) var(--space-8)', fontSize: '1rem', minHeight: '52px' },
}

function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading

  const baseStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    letterSpacing: '0',
    textTransform: 'none',
    border: '1px solid transparent',
    borderRadius: variant === 'primary' ? 'var(--radius-pill)' : 'var(--radius-sm)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    transition: 'background-color var(--transition-normal), border-color var(--transition-normal), color var(--transition-normal)',
    whiteSpace: 'nowrap',
    position: 'relative',
    opacity: isDisabled ? 0.4 : 1,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...(isLoading ? { color: 'transparent' } : {}),
    ...style,
  }

  return (
    <button
      disabled={isDisabled}
      aria-busy={isLoading}
      style={baseStyle}
      {...rest}
    >
      {children}
      {isLoading && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: 14,
            height: 14,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            color: variantStyles[variant].color as string,
          }}
        />
      )}
    </button>
  )
}

export default Button
