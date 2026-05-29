import apiClient from './client'
import type { Anniversary, CreateAnniversaryRequest } from '../types/anniversary'

export const anniversaryApi = {
  getAnniversaries: () =>
    apiClient.get<{ anniversaries: Anniversary[] }>('/api/anniversaries').then((r) => r.data.anniversaries),

  createAnniversary: (data: CreateAnniversaryRequest) =>
    apiClient.post<{ anniversary: Anniversary }>('/api/anniversaries', data).then((r) => r.data.anniversary),

  deleteAnniversary: (id: string) =>
    apiClient.delete<{ message: string }>(`/api/anniversaries/${id}`).then((r) => r.data),
}
