import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFilterStore } from '../../store/filterStore'
import { useGetCategories, useCreateCategory } from '../../hooks/useCategories'
import { useGetAssignees, useCreateAssignee, useDeleteAssignee } from '../../hooks/useAssignees'
import { useGetAnniversaries, useCreateAnniversary, useDeleteAnniversary } from '../../hooks/useAnniversaries'
import type { TodoStatus } from '../../types/todo'

interface StatusOption {
  value: TodoStatus | null
  labelKey: string
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: null, labelKey: 'filter.all' },
  { value: 'pending', labelKey: 'filter.pending' },
  { value: 'in_progress', labelKey: 'filter.in_progress' },
  { value: 'completed', labelKey: 'filter.completed' },
  { value: 'overdue', labelKey: 'filter.overdue' },
]

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.6875rem',
  fontWeight: 500,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--color-text-secondary)',
  marginBottom: 'var(--space-3)',
}

function optionStyle(isActive: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: '4px',
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    color: isActive ? 'var(--color-accent-active)' : 'var(--color-text-sidebar)',
    fontWeight: isActive ? 600 : 400,
    backgroundColor: isActive ? 'var(--color-bg-sidebar-active)' : 'transparent',
    cursor: 'pointer',
    transition: 'background-color var(--transition-fast), color var(--transition-fast)',
    background: isActive ? 'var(--color-bg-sidebar-active)' : 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
  }
}

function CategoryFilter() {
  const { t } = useTranslation()
  const status = useFilterStore((s) => s.status)
  const categoryId = useFilterStore((s) => s.categoryId)
  const assigneeId = useFilterStore((s) => s.assigneeId)
  const setStatus = useFilterStore((s) => s.setStatus)
  const setCategoryId = useFilterStore((s) => s.setCategoryId)
  const setAssigneeId = useFilterStore((s) => s.setAssigneeId)

  const { data: rawCategories, isLoading: categoriesLoading } = useGetCategories()
  const categories = Array.isArray(rawCategories) ? rawCategories : []
  const createCategory = useCreateCategory()
  const { data: rawAssignees } = useGetAssignees()
  const assignees = Array.isArray(rawAssignees) ? rawAssignees : []
  const createAssignee = useCreateAssignee()
  const deleteAssignee = useDeleteAssignee()

  const [showAddForm, setShowAddForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addError, setAddError] = useState<string | undefined>()

  const [showAddAssigneeForm, setShowAddAssigneeForm] = useState(false)
  const [newAssigneeName, setNewAssigneeName] = useState('')
  const [assigneeError, setAssigneeError] = useState<string | undefined>()

  const { data: rawAnniversaries } = useGetAnniversaries()
  const anniversaries = Array.isArray(rawAnniversaries) ? rawAnniversaries : []
  const createAnniversary = useCreateAnniversary()
  const deleteAnniversary = useDeleteAnniversary()

  const [showAddAnniversaryForm, setShowAddAnniversaryForm] = useState(false)
  const [newAnniversaryName, setNewAnniversaryName] = useState('')
  const [newAnniversaryMonth, setNewAnniversaryMonth] = useState('')
  const [newAnniversaryDay, setNewAnniversaryDay] = useState('')
  const [anniversaryError, setAnniversaryError] = useState<string | undefined>()

  const handleAddAnniversary = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newAnniversaryName.trim()
    const month = Number(newAnniversaryMonth)
    const day = Number(newAnniversaryDay)
    if (!name || !month || !day) return
    setAnniversaryError(undefined)
    createAnniversary.mutate(
      { name, month, day },
      {
        onSuccess: () => {
          setNewAnniversaryName(''); setNewAnniversaryMonth(''); setNewAnniversaryDay('')
          setShowAddAnniversaryForm(false)
        },
        onError: (err) => {
          const msg = err.response?.data?.error?.message
          setAnniversaryError(msg ?? '기념일 추가에 실패했습니다.')
        },
      }
    )
  }

  const handleAddAssignee = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newAssigneeName.trim()
    if (!name) return
    setAssigneeError(undefined)
    createAssignee.mutate(
      { name },
      {
        onSuccess: () => { setNewAssigneeName(''); setShowAddAssigneeForm(false) },
        onError: (err) => {
          const msg = err.response?.data?.error?.message
          setAssigneeError(msg ?? '담당자 추가에 실패했습니다.')
        },
      }
    )
  }

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newCategoryName.trim()
    if (!name) return

    setAddError(undefined)
    createCategory.mutate(
      { name },
      {
        onSuccess: () => {
          setNewCategoryName('')
          setShowAddForm(false)
        },
        onError: (err) => {
          const msg = err.response?.data?.error?.message
          setAddError(msg ?? '카테고리 추가에 실패했습니다.')
        },
      }
    )
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-sidebar)',
        borderRight: '1px solid var(--color-border-default)',
        padding: 'var(--space-6) var(--space-5)',
        minHeight: '100%',
      }}
    >
      {/* 상태 필터 */}
      <section aria-labelledby="status-filter-title">
        <p id="status-filter-title" style={sectionTitleStyle}>
          {t('filter.status')}
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {STATUS_OPTIONS.map((opt) => {
            const isActive = status === opt.value
            return (
              <li key={String(opt.value)}>
                <button
                  onClick={() => setStatus(opt.value)}
                  style={optionStyle(isActive)}
                  aria-pressed={isActive}
                  data-testid={`status-filter-${opt.value ?? 'all'}`}
                >
                  {t(opt.labelKey)}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      {/* 담당자 필터 */}
      <section aria-labelledby="assignee-filter-title" style={{ marginTop: 'var(--space-6)' }}>
        <p id="assignee-filter-title" style={sectionTitleStyle}>
          {t('filter.assignee')}
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li>
            <button
              onClick={() => setAssigneeId(null)}
              style={optionStyle(assigneeId === null)}
              aria-pressed={assigneeId === null}
              data-testid="assignee-filter-all"
            >
              {t('filter.all')}
            </button>
          </li>
          {assignees.map((a) => {
            const isActive = assigneeId === a.id
            return (
              <li key={a.id} style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => setAssigneeId(a.id)}
                  style={{ ...optionStyle(isActive), flex: 1 }}
                  aria-pressed={isActive}
                  data-testid={`assignee-filter-${a.id}`}
                >
                  {a.name}
                </button>
                <button
                  data-testid={`assignee-delete-${a.id}`}
                  onClick={() => deleteAssignee.mutate(a.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-disabled)', fontSize: '0.75rem', padding: '0 var(--space-1)' }}
                  aria-label={`${a.name} 삭제`}
                >
                  ×
                </button>
              </li>
            )
          })}
        </ul>

        {!showAddAssigneeForm ? (
          <button
            data-testid="add-assignee-toggle"
            onClick={() => setShowAddAssigneeForm(true)}
            style={{ marginTop: 'var(--space-3)', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
          >
            {t('filter.add_assignee')}
          </button>
        ) : (
          <form
            onSubmit={handleAddAssignee}
            style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
          >
            <input
              data-testid="new-assignee-input"
              type="text"
              value={newAssigneeName}
              onChange={(e) => { setNewAssigneeName(e.target.value); setAssigneeError(undefined) }}
              placeholder={t('filter.assignee_placeholder')}
              autoFocus
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2) var(--space-3)', outline: 'none', width: '100%', boxSizing: 'border-box' as const }}
            />
            {assigneeError && <p style={{ fontSize: '0.75rem', color: 'var(--color-error)', margin: 0 }}>{assigneeError}</p>}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                data-testid="add-assignee-submit"
                type="submit"
                disabled={createAssignee.isPending}
                style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-inverse)', backgroundColor: 'var(--color-accent)', border: 'none', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)', cursor: createAssignee.isPending ? 'not-allowed' : 'pointer', opacity: createAssignee.isPending ? 0.6 : 1 }}
              >
                {t('filter.add')}
              </button>
              <button
                data-testid="add-assignee-cancel"
                type="button"
                onClick={() => { setShowAddAssigneeForm(false); setNewAssigneeName(''); setAssigneeError(undefined) }}
                style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', backgroundColor: 'transparent', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)', cursor: 'pointer' }}
              >
                {t('todo.cancel')}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 카테고리 필터 */}
      <section
        aria-labelledby="category-filter-title"
        style={{ marginTop: 'var(--space-6)' }}
      >
        <p id="category-filter-title" style={sectionTitleStyle}>
          {t('filter.category')}
        </p>
        {categoriesLoading ? (
          <p
            style={{ fontSize: '0.8125rem', color: 'var(--color-text-disabled)' }}
            aria-label={t('todo.loading')}
          >
            {t('todo.loading')}...
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li>
              <button
                onClick={() => setCategoryId(null)}
                style={optionStyle(categoryId === null)}
                aria-pressed={categoryId === null}
                data-testid="category-filter-all"
              >
                {t('filter.all')}
              </button>
            </li>
            {categories.map((cat) => {
              const isActive = categoryId === cat.id
              return (
                <li key={cat.id}>
                  <button
                    onClick={() => setCategoryId(cat.id)}
                    style={optionStyle(isActive)}
                    aria-pressed={isActive}
                    data-testid={`category-filter-${cat.id}`}
                  >
                    {cat.name}
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {/* 카테고리 추가 */}
        {!showAddForm ? (
          <button
            data-testid="add-category-toggle"
            onClick={() => setShowAddForm(true)}
            style={{
              marginTop: 'var(--space-3)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--color-accent)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textAlign: 'left',
            }}
          >
            {t('filter.add_category')}
          </button>
        ) : (
          <form
            onSubmit={handleAddCategory}
            style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
          >
            <input
              data-testid="new-category-input"
              type="text"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value)
                setAddError(undefined)
              }}
              placeholder={t('filter.category_placeholder')}
              autoFocus
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8125rem',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-2) var(--space-3)',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box' as const,
              }}
            />
            {addError && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-error)', margin: 0 }}>
                {addError}
              </p>
            )}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                data-testid="add-category-submit"
                type="submit"
                disabled={createCategory.isPending}
                style={{
                  flex: 1,
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--color-text-inverse)',
                  backgroundColor: 'var(--color-accent)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-2)',
                  cursor: createCategory.isPending ? 'not-allowed' : 'pointer',
                  opacity: createCategory.isPending ? 0.6 : 1,
                }}
              >
                {t('filter.add')}
              </button>
              <button
                data-testid="add-category-cancel"
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setNewCategoryName('')
                  setAddError(undefined)
                }}
                style={{
                  flex: 1,
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-2)',
                  cursor: 'pointer',
                }}
              >
                {t('todo.cancel')}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 기념일 관리 */}
      <section aria-labelledby="anniversary-section-title" style={{ marginTop: 'var(--space-6)' }}>
        <p id="anniversary-section-title" style={sectionTitleStyle}>
          {t('filter.anniversary')}
        </p>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {anniversaries.map((a) => (
            <li key={a.id} style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-1) 0' }}>
              <span style={{
                flex: 1,
                fontFamily: 'var(--font-body)',
                fontSize: '0.8125rem',
                color: 'var(--color-text-sidebar)',
              }}>
                {a.name}
                <span style={{ marginLeft: 6, fontSize: '0.75rem', color: '#e91e63', fontWeight: 500 }}>
                  {a.month}/{a.day}
                </span>
              </span>
              <button
                data-testid={`anniversary-delete-${a.id}`}
                onClick={() => deleteAnniversary.mutate(a.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-disabled)', fontSize: '0.75rem', padding: '0 var(--space-1)' }}
                aria-label={`${a.name} 삭제`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        {!showAddAnniversaryForm ? (
          <button
            data-testid="add-anniversary-toggle"
            onClick={() => setShowAddAnniversaryForm(true)}
            style={{ marginTop: 'var(--space-3)', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
          >
            {t('filter.add_anniversary')}
          </button>
        ) : (
          <form
            onSubmit={handleAddAnniversary}
            style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
          >
            <input
              data-testid="new-anniversary-name"
              type="text"
              value={newAnniversaryName}
              onChange={(e) => { setNewAnniversaryName(e.target.value); setAnniversaryError(undefined) }}
              placeholder={t('filter.anniversary_name_placeholder')}
              autoFocus
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2) var(--space-3)', outline: 'none', width: '100%', boxSizing: 'border-box' as const }}
            />
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                data-testid="new-anniversary-month"
                type="number" min={1} max={12}
                value={newAnniversaryMonth}
                onChange={(e) => { setNewAnniversaryMonth(e.target.value); setAnniversaryError(undefined) }}
                placeholder={t('filter.anniversary_month_placeholder')}
                style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)', outline: 'none', textAlign: 'center' }}
              />
              <input
                data-testid="new-anniversary-day"
                type="number" min={1} max={31}
                value={newAnniversaryDay}
                onChange={(e) => { setNewAnniversaryDay(e.target.value); setAnniversaryError(undefined) }}
                placeholder={t('filter.anniversary_day_placeholder')}
                style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)', outline: 'none', textAlign: 'center' }}
              />
            </div>
            {anniversaryError && <p style={{ fontSize: '0.75rem', color: 'var(--color-error)', margin: 0 }}>{anniversaryError}</p>}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                data-testid="add-anniversary-submit"
                type="submit"
                disabled={createAnniversary.isPending}
                style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-inverse)', backgroundColor: 'var(--color-accent)', border: 'none', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)', cursor: createAnniversary.isPending ? 'not-allowed' : 'pointer', opacity: createAnniversary.isPending ? 0.6 : 1 }}
              >
                {t('filter.add')}
              </button>
              <button
                data-testid="add-anniversary-cancel"
                type="button"
                onClick={() => { setShowAddAnniversaryForm(false); setNewAnniversaryName(''); setNewAnniversaryMonth(''); setNewAnniversaryDay(''); setAnniversaryError(undefined) }}
                style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', backgroundColor: 'transparent', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)', cursor: 'pointer' }}
              >
                {t('todo.cancel')}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

export default CategoryFilter
