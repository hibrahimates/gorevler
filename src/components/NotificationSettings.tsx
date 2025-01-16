import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'

export default function NotificationSettings() {
  const { currentUser } = useAuth()
  const { preferences, updatePreference, requestNotificationPermission } = useNotification()
  const [enabled, setEnabled] = useState(true)
  const [reminderTime, setReminderTime] = useState(15)

  useEffect(() => {
    if (currentUser?.username && preferences[currentUser.username]) {
      const userPrefs = preferences[currentUser.username]
      setEnabled(userPrefs.enabled)
      setReminderTime(userPrefs.reminderTime)
    }
  }, [currentUser, preferences])

  const handleSave = async () => {
    if (!currentUser) return

    if (enabled && !preferences[currentUser.username]?.enabled) {
      await requestNotificationPermission()
    }

    updatePreference(currentUser.username, {
      enabled,
      reminderTime
    })
  }

  if (!currentUser) return null

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-lg font-semibold">Bildirim Ayarları</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Görev Hatırlatmaları</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hatırlatma Zamanı
          </label>
          <select
            value={reminderTime}
            onChange={(e) => setReminderTime(Number(e.target.value))}
            disabled={!enabled}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value={5}>5 dakika önce</option>
            <option value={10}>10 dakika önce</option>
            <option value={15}>15 dakika önce</option>
            <option value={30}>30 dakika önce</option>
            <option value={60}>1 saat önce</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Kaydet
        </button>
      </div>
    </div>
  )
} 