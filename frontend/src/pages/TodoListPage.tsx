import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFilterStore } from '../store/filterStore'
import { useGetTodos, useCompleteTodo, useDeleteTodo } from '../hooks/useTodos'
import { useGetCategories } from '../hooks/useCategories'
import { calcTodoStatus, STATUS_COLOR } from '../utils/todoStatus'
import { formatDateTime } from '../utils/formatDate'
import NavBar from '../components/common/NavBar'
import Button from '../components/common/Button'
import CategoryFilter from '../components/category/CategoryFilter'
import TodoList from '../components/todo/TodoList'
import TodoCalendar from '../components/todo/TodoCalendar'

function TodoListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const status = useFilterStore((s) => s.status)
  const categoryId = useFilterStore((s) => s.categoryId)
  const assigneeId = useFilterStore((s) => s.assigneeId)
  const viewMode = useFilterStore((s) => s.viewMode)
  const setViewMode = useFilterStore((s) => s.setViewMode)

  const filter = {
    ...(status ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(assigneeId ? { assigneeId } : {}),
  }

  const { data: todos = [], isLoading, isError, refetch } = useGetTodos(filter)
  const { data: allTodos = [] } = useGetTodos()
  const { data: categories = [] } = useGetCategories()
  const { mutate: completeTodo, variables: completingId } = useCompleteTodo()
  const { mutate: deleteTodo, variables: deletingId } = useDeleteTodo()

  const newItems = [...allTodos].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
      <NavBar />

      <div className="todo-page-layout">
        {/* 사이드바 */}
        <aside style={{ position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' }}>
          <CategoryFilter />
        </aside>

        {/* 메인 콘텐츠 */}
        <section style={{ padding: 'var(--space-8) var(--space-8) var(--space-10)', minWidth: 0 }}>

          {/* 신규 항목 */}
          {newItems.length > 0 && (
            <div
              data-testid="new-items-section"
              style={{
                marginBottom: 'var(--space-8)',
                padding: 'var(--space-5) var(--space-6)',
                backgroundColor: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--color-border-default)',
              }}
            >
              <p style={sectionLabelStyle}>{t('todo.new_items')}</p>
              <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {newItems.map((todo, idx) => {
                  const todoStatus = calcTodoStatus(todo)
                  const isLast = idx === newItems.length - 1
                  return (
                    <li
                      key={todo.id}
                      data-testid={`new-item-${todo.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-3) 0',
                        borderBottom: isLast ? 'none' : '1px solid var(--color-border-default)',
                      }}
                    >
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6875rem',
                        color: 'var(--color-text-disabled)',
                        minWidth: 20,
                        textAlign: 'right',
                        flexShrink: 0,
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{
                        flex: 1,
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.875rem',
                        color: 'var(--color-text-primary)',
                        textDecoration: todo.isCompleted ? 'line-through' : 'none',
                      }}>
                        {todo.title}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: STATUS_COLOR[todoStatus],
                        backgroundColor: `${STATUS_COLOR[todoStatus]}18`,
                        padding: '2px 10px',
                        borderRadius: 'var(--radius-pill)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        {t(`status.${todoStatus}`)}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6875rem',
                        color: 'var(--color-text-disabled)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        {formatDateTime(todo.createdAt)}
                      </span>
                    </li>
                  )
                })}
              </ol>
            </div>
          )}

          {/* 헤더 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-6)',
          }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                lineHeight: 1.2,
              }}>
                {t('todo.list_title')}
              </h1>
              {todos.length > 0 && (
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)',
                  marginTop: 'var(--space-1)',
                }}>
                  {todos.length}개 항목
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              {/* Segmented Control */}
              <div style={{
                display: 'flex',
                backgroundColor: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-md)',
                padding: '3px',
                gap: '2px',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <button
                  data-testid="view-mode-list"
                  onClick={() => setViewMode('list')}
                  aria-pressed={viewMode === 'list'}
                  style={segmentBtnStyle(viewMode === 'list')}
                >
                  {t('todo.list_view')}
                </button>
                <button
                  data-testid="view-mode-calendar"
                  onClick={() => setViewMode('calendar')}
                  aria-pressed={viewMode === 'calendar'}
                  style={segmentBtnStyle(viewMode === 'calendar')}
                >
                  {t('todo.calendar_view')}
                </button>
              </div>

              <Button
                onClick={() => navigate('/todos/new')}
                size="sm"
                data-testid="new-todo-button"
              >
                {t('todo.new_button')}
              </Button>
            </div>
          </div>

          {/* 목록 / 캘린더 */}
          {viewMode === 'list' ? (
            <TodoList
              todos={todos}
              categories={categories}
              isLoading={isLoading}
              isError={isError}
              onComplete={(id) => completeTodo(id)}
              onDelete={(id) => deleteTodo(id)}
              completingId={completingId ?? null}
              deletingId={deletingId ?? null}
              onRetry={() => refetch()}
            />
          ) : (
            /* 캘린더 뷰: 왼쪽 목록 + 오른쪽 캘린더 (각 50%) */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', alignItems: 'start' }}>
              <div style={{ minWidth: 0 }}>
                <TodoList
                  todos={todos}
                  categories={categories}
                  isLoading={isLoading}
                  isError={isError}
                  onComplete={(id) => completeTodo(id)}
                  onDelete={(id) => deleteTodo(id)}
                  completingId={completingId ?? null}
                  deletingId={deletingId ?? null}
                  onRetry={() => refetch()}
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <TodoCalendar todos={allTodos} />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'var(--color-text-secondary)',
  marginBottom: 'var(--space-4)',
}

function segmentBtnStyle(isActive: boolean): React.CSSProperties {
  return {
    fontFamily: 'var(--font-body)',
    fontSize: '0.8125rem',
    fontWeight: isActive ? 600 : 400,
    letterSpacing: '0',
    textTransform: 'none',
    padding: 'var(--space-2) var(--space-4)',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
    backgroundColor: isActive ? 'var(--color-bg-elevated)' : 'transparent',
    cursor: 'pointer',
    transition: 'background-color var(--transition-fast), color var(--transition-fast)',
    minHeight: '32px',
  }
}

export default TodoListPage
