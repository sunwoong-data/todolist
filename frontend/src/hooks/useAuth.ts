import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { authApi } from '../api/authApi'
import { userApi } from '../api/userApi'
import { useAuthStore } from '../store/authStore'
import type { LoginRequest, LoginResponse, RegisterRequest, UpdateProfileRequest, User } from '../types/user'
import type { ApiError } from '../types/api'

export function useLogin() {
  const login = useAuthStore((state) => state.login)

  return useMutation<LoginResponse, AxiosError<ApiError>, LoginRequest>({
    mutationFn: (data) => authApi.login(data),
    onSuccess: (data) => {
      login({
        userId: data.user.id,
        token: data.token,
        name: data.user.name,
        themePreference: data.user.themePreference,
        languagePreference: data.user.languagePreference,
      })
    },
  })
}

export function useRegister() {
  return useMutation<User, AxiosError<ApiError>, RegisterRequest>({
    mutationFn: (data) => authApi.register(data),
  })
}

export function useUpdateProfile() {
  const updateName = useAuthStore((state) => state.updateName)
  const updateTheme = useAuthStore((state) => state.updateTheme)
  const updateLanguage = useAuthStore((state) => state.updateLanguage)

  return useMutation<User, AxiosError<ApiError>, UpdateProfileRequest>({
    mutationFn: (data) => userApi.updateMe(data),
    onSuccess: (data) => {
      updateName(data.name)
      updateTheme(data.themePreference)
      updateLanguage(data.languagePreference)
    },
  })
}
