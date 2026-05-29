import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Todo, TodoStatus } from '../../types/todo'
import type { Assignee } from '../../types/assignee'
import { calcTodoStatus, STATUS_COLOR } from '../../utils/todoStatus'
import { formatDateTime } from '../../utils/formatDate'
import { getAssigneeColor, getAssigneeColorLight } from '../../utils/assigneeColor'
import Modal from '../common/Modal'
import Button from '../common/Button'

interface TodoItemProps {
  todo: Todo
  categoryName?: string
  assignee?: Assignee
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  isCompleting?: boolean
  isDeleting?: boolean
}

function TodoItem({ todo, categoryName, assignee, onComplete, onDelete, isCompleting, isDeleting }: TodoItemProps) {
  const { t } = useTranslation()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const status = calcTodoStatus(todo)
  const isCompleted = todo.isCompleted

  const STATUS_LABEL_KEY: Record<TodoStatus, string> = {
    pending: 'status.pending',
    in_progress: 'status.in_progress',
    overdue: 'status.overdue',
    completed: 'status.completed',
  }

  const cardStyle: React.CSSProperties = {
    position: 'relative',
    backgroundColor: 'var(--color-bg-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border-default)',
    borderLeft: assignee ? `3px solid ${getAssigneeColor(assignee.id)}` : '1px solid var(--color-border-default)',
    boxShadow: 'var(--shadow-sm)',
    padding: 'var(--space-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
    opacity: isCompleted ? 0.5 : 1,
    transition: 'box-shadow var(--transition-normal), transform var(--transition-fast)',
  }

  const badgeStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0',
    textTransform: 'none',
    padding: '3px 10px',
    borderRadius: 'var(--radius-pill)',
    display: 'inline-block',
    backgroundColor: `${STATUS_COLOR[status]}18`,
    color: STATUS_COLOR[status],
    border: 'none',
    alignSelf: 'flex-start',
  }

  const titleStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    lineHeight: 1.3,
    textDecoration: isCompleted ? 'line-through' : 'none',
  }

  const metaStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.8125rem',
    letterSpacing: '0',
    textTransform: 'none',
    color: 'var(--color-text-secondary)',
  }

  const metaParts: string[] = []
  if (categoryName) metaParts.push(categoryName)
  if (todo.startDate || todo.endDate) {
    const range = [todo.startDate, todo.endDate].filter(Boolean).join(' ~ ')
    metaParts.push(range)
  }

  return (
    <>
      <article style={cardStyle} data-testid={`todo-item-${todo.id}`}>
        {assignee && (
          <div
            data-testid={`assignee-avatar-${assignee.id}`}
            style={{
              position: 'absolute',
              top: 'var(--space-4)',
              right: 'var(--space-4)',
              width: 48,
              height: 48,
              borderRadius: '50%',
              overflow: 'hidden',
              border: `2.5px solid ${getAssigneeColor(assignee.id)}`,
              backgroundColor: getAssigneeColorLight(assignee.id),
              flexShrink: 0,
            }}
          >
            {assignee.avatar ? (
              <img
                src={assignee.avatar}
                alt={assignee.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.125rem', fontWeight: 700,
                color: getAssigneeColor(assignee.id),
                fontFamily: 'var(--font-body)',
              }}>
                {assignee.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}
        <span style={badgeStyle} data-testid="todo-status-badge">
          {t(STATUS_LABEL_KEY[status])}
        </span>

        <p style={titleStyle} data-testid="todo-title">
          {todo.title}
        </p>

        {metaParts.length > 0 && (
          <p style={metaStyle} data-testid="todo-meta">
            {metaParts.join(' · ')}
          </p>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-1)' }}>
          <span
            data-testid="todo-created-at"
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-disabled)' }}
          >
            {t('todo.created_at')}: {formatDateTime(todo.createdAt)}
          </span>
          {todo.updatedAt !== todo.createdAt && (
            <span
              data-testid="todo-updated-at"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-disabled)' }}
            >
              {t('todo.updated_at')}: {formatDateTime(todo.updatedAt)}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          {!isCompleted && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onComplete(todo.id)}
              isLoading={isCompleting}
              data-testid="complete-button"
            >
              {t('todo.complete')}
            </Button>
          )}

          <Link
            to={`/todos/${todo.id}/edit`}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              letterSpacing: '0',
              textTransform: 'none',
              padding: 'var(--space-2) var(--space-4)',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-primary)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
            data-testid="edit-link"
          >
            {t('todo.edit')}
          </Link>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            isLoading={isDeleting}
            data-testid="delete-button"
          >
            {t('todo.delete')}
          </Button>
        </div>
      </article>

      <Modal
        isOpen={showDeleteModal}
        title={t('todo.delete_confirm_title')}
        onConfirm={() => {
          onDelete(todo.id)
          setShowDeleteModal(false)
        }}
        onCancel={() => setShowDeleteModal(false)}
        confirmLabel={t('todo.delete')}
        cancelLabel={t('todo.cancel')}
        isLoading={isDeleting}
      >
        {t('todo.delete_confirm_msg')}
      </Modal>
    </>
  )
}

export default TodoItem
