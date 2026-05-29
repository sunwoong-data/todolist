import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetTodo, useUpdateTodo } from '../hooks/useTodos'
import NavBar from '../components/common/NavBar'
import TodoForm from '../components/todo/TodoForm'

function TodoEditPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: todo, isLoading, isError } = useGetTodo(id ?? '')
  const { mutate: updateTodo, isPending } = useUpdateTodo()

  useEffect(() => {
    if (isError) navigate('/')
  }, [isError, navigate])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
      <NavBar />

      <main className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <div
          style={{
            maxWidth: 640,
            margin: '0 auto',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-default)',
            padding: 'var(--space-10) var(--space-8)',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-8)',
            }}
          >
            {t('todo.edit_title')}
          </h1>

          {isLoading ? (
            <div
              aria-label={t('todo.loading')}
              style={{
                height: 200,
                background: `linear-gradient(90deg, var(--color-bg-surface) 25%, var(--color-bg-elevated) 50%, var(--color-bg-surface) 75%)`,
                backgroundSize: '200% 100%',
                animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
              }}
            />
          ) : todo ? (
            <TodoForm
              initialValues={{
                title: todo.title,
                description: todo.description ?? '',
                categoryId: todo.categoryId,
                startDate: todo.startDate ?? '',
                endDate: todo.endDate ?? '',
              }}
              onSubmit={(data) =>
                updateTodo({ id: id!, data }, { onSuccess: () => navigate('/') })
              }
              onCancel={() => navigate('/')}
              isLoading={isPending}
              submitLabel={t('todo.save')}
            />
          ) : null}
        </div>
      </main>
    </div>
  )
}

export default TodoEditPage
