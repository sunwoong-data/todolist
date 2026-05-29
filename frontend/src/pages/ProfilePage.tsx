import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { AxiosError } from 'axios'
import NavBar from '../components/common/NavBar'
import { useAuthStore } from '../store/authStore'
import { useUpdateProfile } from '../hooks/useAuth'
import type { ApiError } from '../types/api'
import type { Theme, Language } from '../types/user'

function ProfilePage() {
  const { t } = useTranslation()
  const name = useAuthStore((state) => state.name)
  const themePreference = useAuthStore((state) => state.themePreference)
  const languagePreference = useAuthStore((state) => state.languagePreference)
  const navigate = useNavigate()

  const [nameValue, setNameValue] = useState(name ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [nameSuccess, setNameSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [themeSuccess, setThemeSuccess] = useState(false)
  const [languageSuccess, setLanguageSuccess] = useState(false)
  const [nameError, setNameError] = useState<string | undefined>()
  const [passwordError, setPasswordError] = useState<string | undefined>()
  const [themeError, setThemeError] = useState<string | undefined>()
  const [languageError, setLanguageError] = useState<string | undefined>()

  const nameMutation = useUpdateProfile()
  const passwordMutation = useUpdateProfile()
  const themeMutation = useUpdateProfile()
  const languageMutation = useUpdateProfile()

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setNameSuccess(false)
    setNameError(undefined)
    nameMutation.mutate(
      { name: nameValue },
      {
        onSuccess: () => setNameSuccess(true),
        onError: (err) => {
          const axiosErr = err as AxiosError<ApiError>
          setNameError(axiosErr.response?.data?.error?.message ?? t('profile.name_fail'))
        },
      }
    )
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSuccess(false)
    setPasswordError(undefined)
    if (!newPassword) return
    passwordMutation.mutate(
      { password: newPassword },
      {
        onSuccess: () => {
          setNewPassword('')
          setPasswordSuccess(true)
        },
        onError: (err) => {
          const axiosErr = err as AxiosError<ApiError>
          setPasswordError(axiosErr.response?.data?.error?.message ?? t('profile.password_fail'))
        },
      }
    )
  }

  const handleThemeChange = (theme: Theme) => {
    setThemeSuccess(false)
    setThemeError(undefined)
    themeMutation.mutate(
      { themePreference: theme },
      {
        onSuccess: () => setThemeSuccess(true),
        onError: (err) => {
          const axiosErr = err as AxiosError<ApiError>
          setThemeError(axiosErr.response?.data?.error?.message ?? t('profile.theme_fail'))
        },
      }
    )
  }

  const handleLanguageChange = (language: Language) => {
    setLanguageSuccess(false)
    setLanguageError(undefined)
    languageMutation.mutate(
      { languagePreference: language },
      {
        onSuccess: () => setLanguageSuccess(true),
        onError: (err) => {
          const axiosErr = err as AxiosError<ApiError>
          setLanguageError(axiosErr.response?.data?.error?.message ?? t('profile.language_fail'))
        },
      }
    )
  }

  const sectionStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-default)',
    padding: 'var(--space-8)',
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '1.125rem',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-6)',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  }

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-bg-elevated)',
    border: `1px solid ${hasError ? 'var(--color-error)' : 'var(--color-border-default)'}`,
    padding: 'var(--space-3) var(--space-4)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  })

  const saveButtonStyle = (isPending: boolean): React.CSSProperties => ({
    alignSelf: 'flex-start',
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--color-bg-base)',
    backgroundColor: 'var(--color-text-primary)',
    border: 'none',
    padding: 'var(--space-2) var(--space-6)',
    cursor: isPending ? 'not-allowed' : 'pointer',
    opacity: isPending ? 0.6 : 1,
  })

  const themeButtonStyle = (isActive: boolean, isPending: boolean): React.CSSProperties => ({
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    fontWeight: isActive ? 700 : 400,
    padding: 'var(--space-2) var(--space-5)',
    border: `1px solid ${isActive ? 'var(--color-text-primary)' : 'var(--color-border-default)'}`,
    color: isActive ? 'var(--color-bg-base)' : 'var(--color-text-secondary)',
    backgroundColor: isActive ? 'var(--color-text-primary)' : 'transparent',
    cursor: isPending ? 'not-allowed' : 'pointer',
    opacity: isPending ? 0.6 : 1,
    transition: 'all var(--transition-fast)',
  })

  const languageOptions: { value: Language; label: string }[] = [
    { value: 'ko', label: '한국어' },
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
      <NavBar />

      <main className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <div
          style={{
            maxWidth: 640,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
          }}
        >
          <button
            onClick={() => navigate('/')}
            style={{
              alignSelf: 'flex-start',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              padding: 0,
            }}
          >
            {t('nav.back_to_list')}
          </button>

          {/* 이름 수정 섹션 */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>{t('profile.name_section')}</h2>

            <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label htmlFor="profile-name" style={labelStyle}>
                  {t('profile.name_label')}
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={nameValue}
                  onChange={(e) => {
                    setNameValue(e.target.value)
                    setNameSuccess(false)
                    setNameError(undefined)
                  }}
                  style={inputStyle(!!nameError)}
                />
                {nameError && (
                  <p data-testid="name-error" style={{ fontSize: '0.875rem', color: 'var(--color-error)', margin: 0 }}>
                    {nameError}
                  </p>
                )}
                {nameSuccess && (
                  <p data-testid="name-success" style={{ fontSize: '0.875rem', color: 'var(--color-success)', margin: 0 }}>
                    {t('profile.name_success')}
                  </p>
                )}
              </div>

              <button
                data-testid="save-name-button"
                type="submit"
                disabled={nameMutation.isPending}
                style={saveButtonStyle(nameMutation.isPending)}
              >
                {nameMutation.isPending ? t('profile.saving') : t('profile.save')}
              </button>
            </form>
          </section>

          {/* 비밀번호 변경 섹션 */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>{t('profile.password_section')}</h2>

            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label htmlFor="profile-password" style={labelStyle}>
                  {t('profile.new_password')}
                </label>
                <input
                  id="profile-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setPasswordSuccess(false)
                    setPasswordError(undefined)
                  }}
                  style={inputStyle(!!passwordError)}
                />
                {passwordError && (
                  <p data-testid="password-error" style={{ fontSize: '0.875rem', color: 'var(--color-error)', margin: 0 }}>
                    {passwordError}
                  </p>
                )}
                {passwordSuccess && (
                  <p data-testid="password-success" style={{ fontSize: '0.875rem', color: 'var(--color-success)', margin: 0 }}>
                    {t('profile.password_success')}
                  </p>
                )}
              </div>

              <button
                data-testid="save-password-button"
                type="submit"
                disabled={passwordMutation.isPending}
                style={saveButtonStyle(passwordMutation.isPending)}
              >
                {passwordMutation.isPending ? t('profile.changing') : t('profile.change')}
              </button>
            </form>
          </section>

          {/* 테마 설정 섹션 */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>{t('profile.theme_section')}</h2>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                data-testid="theme-dark-button"
                onClick={() => handleThemeChange('dark')}
                disabled={themeMutation.isPending}
                style={themeButtonStyle(themePreference === 'dark', themeMutation.isPending)}
              >
                {t('profile.dark')}
              </button>
              <button
                data-testid="theme-light-button"
                onClick={() => handleThemeChange('light')}
                disabled={themeMutation.isPending}
                style={themeButtonStyle(themePreference === 'light', themeMutation.isPending)}
              >
                {t('profile.light')}
              </button>
            </div>

            {themeError && (
              <p data-testid="theme-error" style={{ marginTop: 'var(--space-3)', fontSize: '0.875rem', color: 'var(--color-error)', margin: `var(--space-3) 0 0` }}>
                {themeError}
              </p>
            )}
            {themeSuccess && (
              <p data-testid="theme-success" style={{ marginTop: 'var(--space-3)', fontSize: '0.875rem', color: 'var(--color-success)', margin: `var(--space-3) 0 0` }}>
                {t('profile.theme_success')}
              </p>
            )}
          </section>

          {/* 언어 설정 섹션 */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>{t('profile.language_section')}</h2>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              {languageOptions.map((opt) => (
                <button
                  key={opt.value}
                  data-testid={`language-${opt.value}-button`}
                  onClick={() => handleLanguageChange(opt.value)}
                  disabled={languageMutation.isPending}
                  style={themeButtonStyle(languagePreference === opt.value, languageMutation.isPending)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {languageError && (
              <p data-testid="language-error" style={{ marginTop: 'var(--space-3)', fontSize: '0.875rem', color: 'var(--color-error)', margin: `var(--space-3) 0 0` }}>
                {languageError}
              </p>
            )}
            {languageSuccess && (
              <p data-testid="language-success" style={{ marginTop: 'var(--space-3)', fontSize: '0.875rem', color: 'var(--color-success)', margin: `var(--space-3) 0 0` }}>
                {t('profile.language_success')}
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default ProfilePage
