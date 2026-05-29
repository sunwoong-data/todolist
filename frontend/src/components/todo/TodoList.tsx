import { useTranslation } from 'react-i18next'
import type { Todo } from '../../types/todo'
import type { Category } from '../../types/category'
import type { Assignee } from '../../types/assignee'
import TodoItem from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  categories?: Category[]
  assignees?: Assignee[]
  isLoading: boolean
  isError: boolean
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  completingId?: string | null
  deletingId?: string | null
  onRetry?: () => void
}

function TodoList({
  todos,
  categories = [],
  assignees,
  isLoading,
  isError,
  onComplete,
  onDelete,
  completingId,
  deletingId,
  onRetry,
}: TodoListProps) {
  const { t } = useTranslation()
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))
  const assigneeMap = Object.fromEntries((assignees ?? []).map((a) => [a.id, a]))

  if (isLoading) {
    return (
      <div aria-label={t('todo.loading')} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 80,
              background: `linear-gradient(90deg, var(--color-bg-surface) 25%, var(--color-bg-elevated) 50%, var(--color-bg-surface) 75%)`,
              backgroundSize: '200% 100%',
              animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
            }}
          />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div
        role="alert"
        style={{ textAlign: 'center', padding: 'var(--space-10) 0', color: 'var(--color-text-secondary)' }}
      >
        <p style={{ marginBottom: 'var(--space-4)' }}>{t('todo.load_error')}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              padding: 'var(--space-2) var(--space-4)',
              border: '1px solid var(--color-border-strong)',
              color: 'var(--color-text-primary)',
              background: 'transparent',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {t('todo.refresh')}
          </button>
        )}
      </div>
    )
  }

  if (todos.length === 0) {
    return (
      <div
        data-testid="empty-state"
        style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--color-text-secondary)' }}
      >
        <img
          src="/seoha-list.png"
          alt="Seoha"
          style={{
            width: 'min(220px, 50vw)',
            height: 'auto',
            objectFit: 'contain',
            marginBottom: 'var(--space-4)',
          }}
        />
        <p style={{ fontSize: '0.875rem' }}>{t('todo.empty')}</p>
      </div>
    )
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {todos.map((todo) => (
        <li key={todo.id}>
          <TodoItem
            todo={todo}
            categoryName={categoryMap[todo.categoryId]}
            assignee={todo.assigneeId ? assigneeMap[todo.assigneeId] : undefined}
            onComplete={onComplete}
            onDelete={onDelete}
            isCompleting={completingId === todo.id}
            isDeleting={deletingId === todo.id}
          />
        </li>
      ))}
    </ul>
  )
}

export default TodoList
