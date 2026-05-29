import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { useLogin } from '../hooks/useAuth'

function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutate: login, isPending, error } = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const errorMessage =
    error?.response?.data?.error?.message ?? (error ? t('auth.login_failed') : undefined)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    login({ email, password }, { onSuccess: () => navigate('/') })
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-8)',
          }}
        >
          {t('auth.login')}
        </h1>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Input
            label={t('auth.email')}
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
            autoComplete="email"
          />

          <Input
            label={t('auth.password')}
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          {errorMessage && (
            <p role="alert" style={{ fontSize: '0.875rem', color: 'var(--color-error)' }}>
              {errorMessage}
            </p>
          )}

          <Button type="submit" isLoading={isPending} style={{ width: '100%' }}>
            {t('auth.login')}
          </Button>
        </form>

        <p
          style={{
            marginTop: 'var(--space-6)',
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
            textAlign: 'center',
          }}
        >
          {t('auth.no_account')}{' '}
          <Link to="/register" style={{ color: 'var(--color-accent)' }}>
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
