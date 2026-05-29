import apiClient from './client'
import type { User, UpdateProfileRequest } from '../types/user'

export const userApi = {
  getMe: () =>
    apiClient.get<{ user: User }>('/api/users/me').then((r) => r.data.user),

  updateMe: (data: UpdateProfileRequest) =>
    apiClient.patch<{ user: User }>('/api/users/me', data).then((r) => r.data.user),
}
