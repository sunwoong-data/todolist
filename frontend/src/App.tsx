import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PrivateRoute from './components/router/PrivateRoute'
import PublicOnlyRoute from './components/router/PublicOnlyRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TodoListPage from './pages/TodoListPage'
import TodoNewPage from './pages/TodoNewPage'
import TodoEditPage from './pages/TodoEditPage'
import ProfilePage from './pages/ProfilePage'
import { useAuthStore } from './store/authStore'

function App() {
  const themePreference = useAuthStore((s) => s.themePreference)
  const languagePreference = useAuthStore((s) => s.languagePreference)
  const { i18n } = useTranslation()

  useEffect(() => {
    document.documentElement.dataset.theme = themePreference
  }, [themePreference])

  useEffect(() => {
    i18n.changeLanguage(languagePreference)
  }, [languagePreference, i18n])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<TodoListPage />} />
          <Route path="/todos/new" element={<TodoNewPage />} />
          <Route path="/todos/:id/edit" element={<TodoEditPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
