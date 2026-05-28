export type Theme = 'light' | 'dark';
export type Language = 'ko' | 'en' | 'ja';

export interface User {
  id: string;
  email: string;
  name: string;
  themePreference: Theme;
  languagePreference: Language;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserDto {
  name?: string;
  password?: string;
  themePreference?: Theme;
  languagePreference?: Language;
}
