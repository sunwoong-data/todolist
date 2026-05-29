import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme, Language } from '../types/user'

interface AuthState {
  userId: string | null
  token: string | null
  name: string | null
  themePreference: Theme
  languagePreference: Language
  isAuthenticated: boolean
  login: (payload: {
    userId: string
    token: string
    name: string
    themePreference: Theme
    languagePreference: Language
  }) => void
  logout: () => void
  updateName: (name: string) => void
  updateTheme: (theme: Theme) => void
  updateLanguage: (language: Language) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      token: null,
      name: null,
      themePreference: 'dark',
      languagePreference: 'ko',
      isAuthenticated: false,
      login: (payload) =>
        set({
          userId: payload.userId,
          token: payload.token,
          name: payload.name,
          themePreference: payload.themePreference,
          languagePreference: payload.languagePreference,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          userId: null,
          token: null,
          name: null,
          themePreference: 'dark',
          languagePreference: 'ko',
          isAuthenticated: false,
        }),
      updateName: (name) => set({ name }),
      updateTheme: (theme) => set({ themePreference: theme }),
      updateLanguage: (language) => set({ languagePreference: language }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        userId: state.userId,
        token: state.token,
        name: state.name,
        themePreference: state.themePreference,
        languagePreference: state.languagePreference,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
