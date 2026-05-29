import { useTranslation } from 'react-i18next'
import { useFilterStore } from '../../store/filterStore'
import { useGetCategories } from '../../hooks/useCategories'
import { useGetAssignees } from '../../hooks/useAssignees'
import type { TodoStatus } from '../../types/todo'

interface FilterBarProps {
  onManage: () => void
}

const selectStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.875rem',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--radius-md)',
  padding: '6px 32px 6px 12px',
  backgroundColor: 'var(--color-bg-surface)',
  color: 'var(--color-text-primary)',
  cursor: 'pointer',
  outline: 'none',
  appearance: 'none',
  backgroundImage:
    'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23888\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 8px center',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 500,
  color: 'var(--color-text-secondary)',
  marginBottom: '4px',
}

const dropdownWrapStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: '12px',
  padding: '12px 0',
  flexWrap: 'wrap',
}

const manageButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-secondary)',
  fontSize: '1.25rem',
  borderRadius: '50%',
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export default function FilterBar({ onManage }: FilterBarProps) {
  const { t } = useTranslation()
  const { status, categoryId, assigneeId, setStatus, setCategoryId, setAssigneeId } = useFilterStore()
  const { data: categories = [] } = useGetCategories()
  const { data: assignees = [] } = useGetAssignees()

  return (
    <div style={containerStyle}>
      <div style={dropdownWrapStyle}>
        <label style={labelStyle}>{t('filter.status')}</label>
        <select
          data-testid="status-select"
          style={selectStyle}
          value={status ?? ''}
          onChange={(e) => {
            const val = e.target.value
            setStatus(val === '' ? null : (val as TodoStatus))
          }}
        >
          <option value="">{t('filter.all')}</option>
          <option value="pending">{t('filter.pending')}</option>
          <option value="in_progress">{t('filter.in_progress')}</option>
          <option value="completed">{t('filter.completed')}</option>
          <option value="overdue">{t('filter.overdue')}</option>
        </select>
      </div>

      <div style={dropdownWrapStyle}>
        <label style={labelStyle}>{t('filter.category')}</label>
        <select
          data-testid="category-select"
          style={selectStyle}
          value={categoryId ?? ''}
          onChange={(e) => {
            const val = e.target.value
            setCategoryId(val === '' ? null : val)
          }}
        >
          {[{ id: '', name: t('filter.all') }, ...categories].map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div style={dropdownWrapStyle}>
        <label style={labelStyle}>{t('filter.assignee')}</label>
        <select
          data-testid="assignee-select"
          style={selectStyle}
          value={assigneeId ?? ''}
          onChange={(e) => {
            const val = e.target.value
            setAssigneeId(val === '' ? null : val)
          }}
        >
          {[{ id: '', name: t('filter.all') }, ...assignees].map((asgn) => (
            <option key={asgn.id} value={asgn.id}>
              {asgn.name}
            </option>
          ))}
        </select>
      </div>

      <button
        data-testid="manage-button"
        style={manageButtonStyle}
        onClick={onManage}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-bg-elevated)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
        }}
      >
        ⚙
      </button>
    </div>
  )
}
