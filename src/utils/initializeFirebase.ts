import { collection, doc, setDoc, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'

const initialSettings = {
  codes: ['KK18', 'DT5', 'GK21', '28C', '61B', '70C&SS'],
  channels: ['KK18', 'DT5', 'GK21', 'OZG34', 'OZG35'],
  types: ['Toplantı', 'Saha', 'Sunum', 'Görev', 'Belge', 'Rapor', 'Kontrol', 'Değerlendirme', 'Planlama', 'Güncelleme', 'Denetim', 'Teknik']
}

const initialTasks = [
  {
    date: new Date().toISOString().split('T')[0],
    startTime: new Date(Date.now() + 6 * 60000).toTimeString().slice(0, 5),
    endTime: new Date(Date.now() + 36 * 60000).toTimeString().slice(0, 5),
    code: 'TEST',
    action: 'Bildirim Test Görevi',
    participants: ['YCE', 'HİA'],
    channel: 'TEST',
    type: 'Test',
    status: 'Beklemede',
    auditRequest: false
  },
  {
    date: '2024-03-07',
    startTime: '09:00',
    endTime: '11:00',
    code: 'KK18',
    action: 'Saha denetimi',
    participants: ['KNS', 'MK', 'HD'],
    channel: 'KK18',
    type: 'Denetim',
    status: 'Beklemede',
    auditRequest: false
  },
  {
    date: '2024-03-11',
    startTime: '13:30',
    endTime: '15:30',
    code: 'DT5',
    action: 'Veri analizi toplantısı',
    participants: ['KNS', 'AY', 'EO'],
    channel: 'DT5',
    type: 'Toplantı',
    status: 'Beklemede',
    auditRequest: false
  }
]

export async function initializeFirebase() {
  try {
    // Check if settings exist
    const settingsDoc = doc(db, 'settings', 'app')
    await setDoc(settingsDoc, initialSettings, { merge: true })
    console.log('Settings initialized')

    // Check if tasks exist
    const tasksSnapshot = await getDocs(collection(db, 'tasks'))
    if (tasksSnapshot.empty) {
      // Add initial tasks
      const tasksCollection = collection(db, 'tasks')
      for (const task of initialTasks) {
        await setDoc(doc(tasksCollection), task)
      }
      console.log('Tasks initialized')
    }

    // Initialize empty notification preferences
    const notificationsDoc = doc(db, 'notifications', 'preferences')
    await setDoc(notificationsDoc, {}, { merge: true })
    console.log('Notification preferences initialized')

    console.log('Firebase initialization completed')
  } catch (error) {
    console.error('Error initializing Firebase:', error)
    throw error
  }
} 