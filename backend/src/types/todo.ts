export type TodoStatus = 'pending' | 'in_progress' | 'overdue' | 'completed';

export interface Todo {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoDto {
  title: string;
  description?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  categoryId?: string;
  startDate?: string | null;
  endDate?: string | null;
}
