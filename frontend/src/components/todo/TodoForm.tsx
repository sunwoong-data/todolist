import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { CreateTodoRequest } from '../../types/todo'
import { useGetCategories } from '../../hooks/useCategories'
import { useGetAssignees } from '../../hooks/useAssignees'
import Input from '../common/Input'
import Button from '../common/Button'

interface InitialValues {
  title?: string
  description?: string
  categoryId?: string
  assigneeId?: string
  startDate?: string
  endDate?: string
}

interface TodoFormProps {
  initialValues?: InitialValues
  onSubmit: (data: CreateTodoRequest) => void
  onCancel: () => void
  isLoading: boolean
  submitLabel?: string
}

function TodoForm({ initialValues = {}, onSubmit, onCancel, isLoading, submitLabel }: TodoFormProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState(initialValues.title ?? '')
  const [description, setDescription] = useState(initialValues.description ?? '')
  const [categoryId, setCategoryId] = useState(initialValues.categoryId ?? '')
  const [assigneeId, setAssigneeId] = useState(initialValues.assigneeId ?? '')
  const [startDate, setStartDate] = useState(initialValues.startDate ?? '')
  const [endDate, setEndDate] = useState(initialValues.endDate ?? '')
  const [dateError, setDateError] = useState<string | null>(null)
  const [titleError, setTitleError] = useState<string | null>(null)

  const { data: categories = [] } = useGetCategories()
  const { data: assignees = [] } = useGetAssignees()

  function validate(): boolean {
    let valid = true
    if (!title.trim()) {
      setTitleError(t('todo.title_required'))
      valid = false
    } else {
      setTitleError(null)
    }
    if (startDate && endDate && endDate < startDate) {
      setDateError(t('todo.date_error'))
      valid = false
    } else {
      setDateError(null)
    }
    return valid
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const data: CreateTodoRequest = {
      title: title.trim(),
      ...(description.trim() && { description: description.trim() }),
      ...(categoryId && { categoryId }),
      ...(assigneeId && { assigneeId }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    }
    onSubmit(data)
  }

  const selectStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'var(--color-bg-base)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border-default)',
    padding: 'var(--space-3) var(--space-4)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9375rem',
    outline: 'none',
    cursor: 'pointer',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-2)',
    display: 'block',
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}
    >
      <Input
        label={t('todo.title_label')}
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('todo.title_placeholder')}
        error={titleError ?? undefined}
        required
      />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label htmlFor="description" style={labelStyle}>{t('todo.desc_label')}</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('todo.desc_placeholder')}
          rows={3}
          style={{
            ...selectStyle,
            resize: 'vertical',
            lineHeight: 1.5,
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label htmlFor="categoryId" style={labelStyle}>{t('todo.category_label')}</label>
        <select
          id="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          style={selectStyle}
        >
          <option value="">{t('todo.default_category')}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label htmlFor="assigneeId" style={labelStyle}>{t('todo.assignee_label')}</label>
        <select
          id="assigneeId"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          style={selectStyle}
          data-testid="assignee-select"
        >
          <option value="">—</option>
          {assignees.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <Input
          label={t('todo.start_date')}
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          label={t('todo.end_date')}
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          error={dateError ?? undefined}
        />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          {t('todo.cancel')}
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {submitLabel ?? t('todo.register')}
        </Button>
      </div>
    </form>
  )
}

export default TodoForm
