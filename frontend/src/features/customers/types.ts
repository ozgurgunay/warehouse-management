export type CustomerDto = {
  id: number
  fullName: string
  email: string | null
  phone: string | null
  address: string | null
  taxNumber: string | null
  companyName: string | null
}

export type CustomerPayload = {
  fullName: string
  email: string | null
  phone: string | null
  address: string | null
  taxNumber: string | null
  companyName: string | null
}
