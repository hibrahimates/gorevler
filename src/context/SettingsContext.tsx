import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'

interface Settings {
  codes: string[]
  channels: string[]
  types: string[]
}

interface SettingsContextType {
  settings: Settings
  addCode: (code: string) => Promise<void>
  removeCode: (code: string) => Promise<void>
  addChannel: (channel: string) => Promise<void>
  removeChannel: (channel: string) => Promise<void>
  addType: (type: string) => Promise<void>
  removeType: (type: string) => Promise<void>
}

const initialSettings: Settings = {
  codes: ['KK18', 'DT5', 'GK21', '28C', '61B', '70C&SS'],
  channels: ['KK18', 'DT5', 'GK21', 'OZG34', 'OZG35'],
  types: ['Toplantı', 'Saha', 'Sunum', 'Görev', 'Belge', 'Rapor', 'Kontrol', 'Değerlendirme', 'Planlama', 'Güncelleme', 'Denetim', 'Teknik']
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(initialSettings)

  useEffect(() => {
    const docRef = doc(db, 'settings', 'app')
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (!snapshot.exists()) {
        setDoc(docRef, initialSettings)
      } else {
        setSettings(snapshot.data() as Settings)
      }
    })

    return () => unsubscribe()
  }, [])

  const updateSettings = async (newSettings: Settings) => {
    try {
      await setDoc(doc(db, 'settings', 'app'), newSettings)
    } catch (error) {
      console.error('Error updating settings:', error)
      throw error
    }
  }

  const addCode = async (code: string) => {
    const newSettings = {
      ...settings,
      codes: [...settings.codes, code]
    }
    await updateSettings(newSettings)
  }

  const removeCode = async (code: string) => {
    const newSettings = {
      ...settings,
      codes: settings.codes.filter(c => c !== code)
    }
    await updateSettings(newSettings)
  }

  const addChannel = async (channel: string) => {
    const newSettings = {
      ...settings,
      channels: [...settings.channels, channel]
    }
    await updateSettings(newSettings)
  }

  const removeChannel = async (channel: string) => {
    const newSettings = {
      ...settings,
      channels: settings.channels.filter(c => c !== channel)
    }
    await updateSettings(newSettings)
  }

  const addType = async (type: string) => {
    const newSettings = {
      ...settings,
      types: [...settings.types, type]
    }
    await updateSettings(newSettings)
  }

  const removeType = async (type: string) => {
    const newSettings = {
      ...settings,
      types: settings.types.filter(t => t !== type)
    }
    await updateSettings(newSettings)
  }

  return (
    <SettingsContext.Provider value={{
      settings,
      addCode,
      removeCode,
      addChannel,
      removeChannel,
      addType,
      removeType
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
} 