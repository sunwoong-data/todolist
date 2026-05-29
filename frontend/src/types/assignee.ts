export interface Assignee {
  id: string
  userId: string
  name: string
  avatar: string | null
}

export interface CreateAssigneeRequest {
  name: string
  avatar?: string | null
}
