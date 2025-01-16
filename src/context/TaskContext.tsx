import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'

interface Task {
  id: string // Firebase document ID için string kullanıyoruz
  date: string
  startTime: string
  endTime: string
  code: string
  action: string
  participants: string[]
  channel: string
  type: string
  status: string
  auditRequest: boolean
  auditRequestedBy?: string
  auditApprovedBy?: string
  auditApprovedAt?: string
}

interface TaskContextType {
  tasks: Task[]
  addTask: (task: Omit<Task, 'id'>) => Promise<void>
  updateTask: (id: string, task: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  requestAudit: (taskId: string, userId: string) => Promise<void>
  approveAudit: (taskId: string, adminId: string) => Promise<void>
  cancelAuditApproval: (taskId: string) => Promise<void>
  reopenTask: (taskId: string) => Promise<void>
  getPendingAudits: () => Task[]
  getCompletedTasks: () => Task[]
  getTasksForUser: (userId: string) => Task[]
  getUpcomingTasksForUser: (userId: string, days: number) => Task[]
  getTeamCalendar: () => Task[]
  hasConflict: (newTask: Omit<Task, 'id'>) => { hasConflict: boolean; conflictingTasks: Task[] }
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    // Firebase'den görevleri dinle
    const q = query(collection(db, 'tasks'), orderBy('date'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData: Task[] = []
      snapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() } as Task)
      })
      setTasks(tasksData)
    })

    return () => unsubscribe()
  }, [])

  const addTask = async (task: Omit<Task, 'id'>) => {
    try {
      await addDoc(collection(db, 'tasks'), task)
    } catch (error) {
      console.error('Error adding task:', error)
      throw error
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const taskRef = doc(db, 'tasks', id)
      await updateDoc(taskRef, updates)
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const taskRef = doc(db, 'tasks', id)
      await deleteDoc(taskRef)
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  const requestAudit = async (taskId: string, userId: string) => {
    await updateTask(taskId, {
      auditRequest: true,
      auditRequestedBy: userId,
      status: 'Denetim Bekliyor'
    })
  }

  const approveAudit = async (taskId: string, adminId: string) => {
    await updateTask(taskId, {
      auditApprovedBy: adminId,
      auditApprovedAt: new Date().toISOString(),
      status: 'Tamamlandı'
    })
  }

  const cancelAuditApproval = async (taskId: string) => {
    await updateTask(taskId, {
      auditApprovedBy: undefined,
      auditApprovedAt: undefined,
      status: 'Devam Ediyor'
    })
  }

  const reopenTask = async (taskId: string) => {
    await updateTask(taskId, {
      status: 'Devam Ediyor',
      auditRequest: false,
      auditRequestedBy: undefined,
      auditApprovedBy: undefined,
      auditApprovedAt: undefined
    })
  }

  const getPendingAudits = () => {
    return tasks.filter(task => task.auditRequest && !task.auditApprovedBy)
  }

  const getCompletedTasks = () => {
    return tasks
      .filter(task => task.status === 'Tamamlandı')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const getTasksForUser = (userId: string) => {
    return tasks.filter(task => 
      task.participants.some(p => p.toLowerCase() === userId.toLowerCase())
    )
  }

  const getUpcomingTasksForUser = (userId: string, days: number = 7) => {
    const today = new Date()
    const endDate = new Date()
    endDate.setDate(today.getDate() + days)

    return tasks.filter(task => {
      const taskDate = new Date(task.date)
      return (
        taskDate >= today &&
        taskDate <= endDate &&
        task.participants.includes(userId) &&
        task.status !== 'Tamamlandı'
      )
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const getTeamCalendar = () => {
    return tasks
      .filter(task => task.status !== 'Tamamlandı')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const hasConflict = (newTask: Omit<Task, 'id'>) => {
    const conflictingTasks = tasks.filter(task => 
      task.date === newTask.date && 
      task.participants.some(p => newTask.participants.includes(p))
    )
    return {
      hasConflict: conflictingTasks.length > 0,
      conflictingTasks
    }
  }

  return (
    <TaskContext.Provider value={{
      tasks,
      addTask,
      updateTask,
      deleteTask,
      requestAudit,
      approveAudit,
      cancelAuditApproval,
      reopenTask,
      getPendingAudits,
      getCompletedTasks,
      getTasksForUser,
      getUpcomingTasksForUser,
      getTeamCalendar,
      hasConflict
    }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider')
  }
  return context
}

export type { Task } 