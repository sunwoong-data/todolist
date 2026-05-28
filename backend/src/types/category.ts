export interface Category {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
}

export interface CreateCategoryDto {
  name: string;
}
