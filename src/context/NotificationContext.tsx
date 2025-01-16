import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from './AuthContext'
import { useTaskContext } from './TaskContext'
import { addMinutes, isBefore, parseISO } from 'date-fns'

interface NotificationPreference {
  enabled: boolean
  reminderTime: number // minutes before task
}

interface UserNotificationPreferences {
  [userId: string]: NotificationPreference
}

interface NotificationContextType {
  preferences: UserNotificationPreferences
  updatePreference: (userId: string, preference: NotificationPreference) => Promise<void>
  requestNotificationPermission: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const DEFAULT_PREFERENCE: NotificationPreference = {
  enabled: true,
  reminderTime: 15 // 15 minutes before by default
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserNotificationPreferences>({})
  const { currentUser } = useAuth()
  const { tasks } = useTaskContext()
  const [lastChecked, setLastChecked] = useState<Date>(new Date())

  useEffect(() => {
    const docRef = doc(db, 'notifications', 'preferences')
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (!snapshot.exists()) {
        setDoc(docRef, {})
      } else {
        setPreferences(snapshot.data())
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!currentUser?.username || !preferences[currentUser.username]?.enabled) return

    const checkInterval = setInterval(() => {
      const now = new Date()
      const userPreference = preferences[currentUser.username] || DEFAULT_PREFERENCE

      tasks.forEach(task => {
        const taskStart = parseISO(`${task.date}T${task.startTime}`)
        const notificationTime = addMinutes(taskStart, -userPreference.reminderTime)

        // Check if we should send a notification
        if (
          task.participants.includes(currentUser.username) &&
          isBefore(notificationTime, now) &&
          isBefore(lastChecked, notificationTime)
        ) {
          // Send browser notification
          new Notification('Yaklaşan Görev Hatırlatması', {
            body: `${task.code} - ${task.action}\nBaşlangıç: ${task.startTime}`,
            icon: '/notification-icon.png'
          })
        }
      })

      setLastChecked(now)
    }, 60000) // Check every minute

    return () => clearInterval(checkInterval)
  }, [currentUser, preferences, tasks, lastChecked])

  const updatePreference = async (userId: string, preference: NotificationPreference) => {
    try {
      const prefsRef = doc(db, 'notifications', 'preferences')
      await setDoc(prefsRef, {
        ...preferences,
        [userId]: preference
      }, { merge: true })
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      throw error
    }
  }

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Bu tarayıcı bildirim özelliğini desteklemiyor.')
      return
    }

    const permission = await Notification.requestPermission()
    if (permission === 'granted' && currentUser) {
      await updatePreference(currentUser.username, DEFAULT_PREFERENCE)
    }
  }

  return (
    <NotificationContext.Provider value={{
      preferences,
      updatePreference,
      requestNotificationPermission
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
} 