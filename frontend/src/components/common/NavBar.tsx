import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import Button from './Button'

function NavBar() {
  const { t } = useTranslation()
  const name = useAuthStore((s) => s.name)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav
      style={{
        height: 56,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--color-border-default)',
        boxShadow: '0 1px 3px rgba(60,64,67,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-6)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Link
        to="/"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '1.125rem',
          fontWeight: 500,
          color: '#5f6368',
          textDecoration: 'none',
        }}
      >
        Seoha love
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {name && (
          <Link
            to="/profile"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
            }}
            data-testid="navbar-user"
          >
            {name}
          </Link>
        )}
        <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="logout-button">
          {t('nav.logout')}
        </Button>
      </div>
    </nav>
  )
}

export default NavBar
