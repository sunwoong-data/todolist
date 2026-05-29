import apiClient from './client'

export interface Holiday {
  date: string
  name: string
}

export const holidayApi = {
  getHolidays: (year: number, month: number) =>
    apiClient
      .get<{ holidays: Holiday[] }>('/api/holidays', { params: { year, month } })
      .then((r) => r.data.holidays),
}
