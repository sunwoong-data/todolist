import apiClient from './client'
import type { Assignee, CreateAssigneeRequest } from '../types/assignee'

export const assigneeApi = {
  getAssignees: () =>
    apiClient.get<{ assignees: Assignee[] }>('/api/assignees').then((r) => r.data.assignees),

  createAssignee: (data: CreateAssigneeRequest) =>
    apiClient.post<{ assignee: Assignee }>('/api/assignees', data).then((r) => r.data.assignee),

  updateAssigneeAvatar: (id: string, avatar: string | null) =>
    apiClient.patch<{ assignee: Assignee }>(`/api/assignees/${id}/avatar`, { avatar }).then((r) => r.data.assignee),

  deleteAssignee: (id: string) =>
    apiClient.delete<{ message: string }>(`/api/assignees/${id}`).then((r) => r.data),
}
