import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCreateTodo } from '../hooks/useTodos'
import NavBar from '../components/common/NavBar'
import TodoForm from '../components/todo/TodoForm'

function TodoNewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutate: createTodo, isPending } = useCreateTodo()

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
            {t('todo.register_title')}
          </h1>

          <TodoForm
            onSubmit={(data) => createTodo(data, { onSuccess: () => navigate('/') })}
            onCancel={() => navigate('/')}
            isLoading={isPending}
            submitLabel={t('todo.register')}
          />
        </div>
      </main>
    </div>
  )
}

export default TodoNewPage
