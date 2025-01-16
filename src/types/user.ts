export type UserRole = 'admin' | 'user'

export interface User {
  id: string
  username: string
  displayName: string
  role: UserRole
}

export const USERS: User[] = [
  { id: '1', username: 'admin', displayName: 'Admin', role: 'admin' },
  { id: '2', username: 'hia', displayName: 'HİA', role: 'user' },
  { id: '3', username: 'yce', displayName: 'YCE', role: 'user' },
  { id: '4', username: 're', displayName: 'RE', role: 'user' },
  { id: '5', username: 'kns', displayName: 'KNS', role: 'user' },
  { id: '6', username: 'yy', displayName: 'YY', role: 'user' },
  { id: '7', username: 'mg', displayName: 'MG', role: 'user' },
  { id: '8', username: 'dt', displayName: 'DT', role: 'user' }
] 