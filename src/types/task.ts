export interface Task {
  id: string
  date: string
  startTime: string
  endTime: string
  code: string
  action: string
  participants: string[]
  channel: string
  type: string
  status: string
  auditRequest?: {
    requestedBy: string
    requestedAt: string
    approvedBy?: string
    approvedAt?: string
  }
} 