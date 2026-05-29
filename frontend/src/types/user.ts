export type Theme = 'light' | 'dark'
export type Language = 'ko' | 'en' | 'ja'

export interface User {
  id: string
  email: string
  name: string
  themePreference: Theme
  languagePreference: Language
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface UpdateProfileRequest {
  name?: string
  password?: string
  themePreference?: Theme
  languagePreference?: Language
}
