export interface Anniversary {
  id: string
  userId: string
  name: string
  month: number
  day: number
}

export interface CreateAnniversaryRequest {
  name: string
  month: number
  day: number
}
