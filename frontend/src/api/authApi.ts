import apiClient from './client'
import type { LoginRequest, RegisterRequest, LoginResponse, User } from '../types/user'

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<{ user: User }>('/api/auth/register', data).then((r) => r.data.user),

  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/api/auth/login', data).then((r) => r.data),
}
