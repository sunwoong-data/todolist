import { useEffect, type ReactNode } from 'react'
import Button from './Button'

interface ModalProps {
  isOpen: boolean
  title: string
  children?: ReactNode
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
}

function Modal({
  isOpen,
  title,
  children,
  onConfirm,
  onCancel,
  confirmLabel = '확인',
  cancelLabel = '취소',
  isLoading = false,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  }

  const modalStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-overlay)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-8)',
    width: '100%',
    maxWidth: 400,
    boxShadow: 'var(--shadow-lg)',
    animation: 'fadeIn 0.2s ease',
  }

  const titleStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-3)',
  }

  const bodyStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-6)',
  }

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--space-3)',
    justifyContent: 'flex-end',
  }

  return (
    <div
      style={backdropStyle}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <p id="modal-title" style={titleStyle}>{title}</p>
        {children && <div style={bodyStyle}>{children}</div>}
        <div style={actionsStyle}>
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Modal
