import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { holidayApi, type Holiday } from '../api/holidayApi'
import type { ApiError } from '../types/api'

export function useGetHolidays(year: number, month: number) {
  return useQuery<Holiday[], AxiosError<ApiError>>({
    queryKey: ['holidays', year, month],
    queryFn: () => holidayApi.getHolidays(year, month),
    staleTime: 1000 * 60 * 60 * 24,
  })
}
