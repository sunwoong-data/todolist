import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetCategories, useCreateCategory } from '../../hooks/useCategories'
import { useGetAssignees, useCreateAssignee, useDeleteAssignee } from '../../hooks/useAssignees'
import { useGetAnniversaries, useCreateAnniversary, useDeleteAnniversary } from '../../hooks/useAnniversaries'

interface ManagePanelProps {
  open: boolean
  onClose: () => void
}

type TabIndex = 0 | 1 | 2

export default function ManagePanel({ open, onClose }: ManagePanelProps) {
  const { t } = useTranslation()
  const [tabIndex, setTabIndex] = useState<TabIndex>(0)

  const { data: categories = [] } = useGetCategories()
  const createCategory = useCreateCategory()

  const { data: assignees = [] } = useGetAssignees()
  const createAssignee = useCreateAssignee()
  const deleteAssignee = useDeleteAssignee()

  const { data: anniversaries = [] } = useGetAnniversaries()
  const createAnniversary = useCreateAnniversary()
  const deleteAnniversary = useDeleteAnniversary()

  const [categoryName, setCategoryName] = useState('')
  const [categoryError, setCategoryError] = useState('')

  const [assigneeName, setAssigneeName] = useState('')
  const [assigneeError, setAssigneeError] = useState('')
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null)

  const [anniversaryName, setAnniversaryName] = useState('')
  const [anniversaryMonth, setAnniversaryMonth] = useState('')
  const [anniversaryDay, setAnniversaryDay] = useState('')
  const [anniversaryError, setAnniversaryError] = useState('')

  function handleAddCategory() {
    setCategoryError('')
    createCategory.mutate(
      { name: categoryName },
      {
        onSuccess: () => setCategoryName(''),
        onError: (err) => setCategoryError(err.response?.data?.error?.message ?? '오류가 발생했습니다'),
      }
    )
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatarDataUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleAddAssignee() {
    setAssigneeError('')
    createAssignee.mutate(
      { name: assigneeName, avatar: avatarDataUrl },
      {
        onSuccess: () => { setAssigneeName(''); setAvatarDataUrl(null) },
        onError: (err) => setAssigneeError(err.response?.data?.error?.message ?? '오류가 발생했습니다'),
      }
    )
  }

  function handleAddAnniversary() {
    setAnniversaryError('')
    createAnniversary.mutate(
      {
        name: anniversaryName,
        month: Number(anniversaryMonth),
        day: Number(anniversaryDay),
      },
      {
        onSuccess: () => {
          setAnniversaryName('')
          setAnniversaryMonth('')
          setAnniversaryDay('')
        },
        onError: (err) => setAnniversaryError(err.response?.data?.error?.message ?? '오류가 발생했습니다'),
      }
    )
  }

  const tabLabels = [
    { key: 'filter.category', testId: 'manage-tab-category' },
    { key: 'filter.assignee', testId: 'manage-tab-assignee' },
    { key: 'filter.anniversary', testId: 'manage-tab-anniversary' },
  ]

  return (
    <>
      {open && (
        <div
          data-testid="manage-panel-overlay"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 100,
          }}
        />
      )}
      <div
        data-testid="manage-panel"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 101,
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
          padding: '0 0 env(safe-area-inset-bottom)',
          maxHeight: '70vh',
          overflowY: 'auto',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: 'var(--color-border-default)',
            margin: '12px auto 0',
          }}
        />
        <div
          style={{
            padding: '16px 20px 8px',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>
            {tabIndex === 0
              ? t('filter.category')
              : tabIndex === 1
              ? t('filter.assignee')
              : t('filter.anniversary')}
          </span>
          <button
            data-testid="manage-close"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
              color: 'var(--color-text-secondary)',
              padding: '0 4px',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '0 20px 24px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 0,
              borderBottom: '2px solid var(--color-border-default)',
              marginBottom: 8,
            }}
          >
            {tabLabels.map((tab, idx) => (
              <button
                key={tab.testId}
                data-testid={tab.testId}
                onClick={() => setTabIndex(idx as TabIndex)}
                style={{
                  padding: '8px 16px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  fontWeight: tabIndex === idx ? 600 : 400,
                  background: 'none',
                  cursor: 'pointer',
                  border: 'none',
                  borderBottom: tabIndex === idx ? '2px solid var(--color-accent)' : 'none',
                  color: tabIndex === idx ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  marginBottom: -2,
                }}
              >
                {t(tab.key)}
              </button>
            ))}
          </div>

          {tabIndex === 0 && (
            <div style={{ marginTop: 8 }}>
              {categories.length === 0 ? (
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-disabled)' }}>없음</span>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    style={{
                      fontSize: '0.875rem',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--color-border-default)',
                    }}
                  >
                    {cat.name}
                  </div>
                ))
              )}
              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <input
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder={t('filter.category_placeholder')}
                  style={{
                    width: '100%',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    boxSizing: 'border-box',
                  }}
                />
                {categoryError && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: 4 }}>
                    {categoryError}
                  </span>
                )}
                <button
                  onClick={handleAddCategory}
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                  }}
                >
                  {t('filter.add')}
                </button>
              </div>
            </div>
          )}

          {tabIndex === 1 && (
            <div style={{ marginTop: 8 }}>
              {assignees.length === 0 ? (
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-disabled)' }}>없음</span>
              ) : (
                assignees.map((assignee) => (
                  <div
                    key={assignee.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--color-border-default)',
                    }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-elevated)', flexShrink: 0 }}>
                      {assignee.avatar ? (
                        <img src={assignee.avatar} alt={assignee.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                          {assignee.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span>{assignee.name}</span>
                    <button
                      onClick={() => deleteAssignee.mutate(assignee.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-disabled)',
                        fontSize: '1rem',
                        padding: '0 8px',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <input
                  value={assigneeName}
                  onChange={(e) => setAssigneeName(e.target.value)}
                  placeholder={t('filter.assignee_placeholder')}
                  style={{
                    width: '100%',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {avatarDataUrl && (
                    <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-border-default)', flexShrink: 0 }}>
                      <img src={avatarDataUrl} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <label style={{ fontSize: '0.8125rem', color: 'var(--color-accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    📷 사진 선택
                    <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                  </label>
                  {avatarDataUrl && (
                    <button onClick={() => setAvatarDataUrl(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-disabled)', fontSize: '0.75rem' }}>
                      제거
                    </button>
                  )}
                </div>
                {assigneeError && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: 4 }}>
                    {assigneeError}
                  </span>
                )}
                <button
                  onClick={handleAddAssignee}
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                  }}
                >
                  {t('filter.add')}
                </button>
              </div>
            </div>
          )}

          {tabIndex === 2 && (
            <div style={{ marginTop: 8 }}>
              {anniversaries.length === 0 ? (
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-disabled)' }}>없음</span>
              ) : (
                anniversaries.map((ann) => (
                  <div
                    key={ann.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--color-border-default)',
                    }}
                  >
                    <span>{ann.name}</span>
                    <span style={{ color: '#e91e63', fontWeight: 500, marginLeft: 8 }}>
                      {ann.month}/{ann.day}
                    </span>
                    <button
                      onClick={() => deleteAnniversary.mutate(ann.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-disabled)',
                        fontSize: '1rem',
                        padding: '0 8px',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <input
                  value={anniversaryName}
                  onChange={(e) => setAnniversaryName(e.target.value)}
                  placeholder={t('filter.anniversary_name_placeholder')}
                  style={{
                    width: '100%',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="number"
                    value={anniversaryMonth}
                    onChange={(e) => setAnniversaryMonth(e.target.value)}
                    placeholder={t('filter.anniversary_month_placeholder')}
                    style={{
                      width: 60,
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      textAlign: 'center',
                    }}
                  />
                  <input
                    type="number"
                    value={anniversaryDay}
                    onChange={(e) => setAnniversaryDay(e.target.value)}
                    placeholder={t('filter.anniversary_day_placeholder')}
                    style={{
                      width: 60,
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      textAlign: 'center',
                    }}
                  />
                </div>
                {anniversaryError && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: 4 }}>
                    {anniversaryError}
                  </span>
                )}
                <button
                  onClick={handleAddAnniversary}
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                  }}
                >
                  {t('filter.add')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
