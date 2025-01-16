import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import NotificationSettings from './NotificationSettings'

export default function Settings() {
  const { settings, addCode, removeCode, addChannel, removeChannel, addType, removeType } = useSettings()
  const { isAdmin } = useAuth()
  const [newCode, setNewCode] = useState('')
  const [newChannel, setNewChannel] = useState('')
  const [newType, setNewType] = useState('')

  const handleAddCode = () => {
    if (newCode.trim()) {
      addCode(newCode.trim().toUpperCase())
      setNewCode('')
    }
  }

  const handleAddChannel = () => {
    if (newChannel.trim()) {
      addChannel(newChannel.trim().toUpperCase())
      setNewChannel('')
    }
  }

  const handleAddType = () => {
    if (newType.trim()) {
      addType(newType.trim())
      setNewType('')
    }
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Sistem Ayarları</h1>
      
      {/* Bildirim Ayarları - Tüm kullanıcılar görebilir */}
      <div className="mb-8">
        <NotificationSettings />
      </div>

      {/* Admin Ayarları */}
      {isAdmin() && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kodlar */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Kodlar</h2>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Yeni kod"
                  className="flex-1 rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  onClick={handleAddCode}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Ekle
                </button>
              </div>
              <div className="space-y-2">
                {settings.codes.map(code => (
                  <div key={code} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>{code}</span>
                    <button
                      onClick={() => removeCode(code)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kanallar */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Kanallar</h2>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value)}
                  placeholder="Yeni kanal"
                  className="flex-1 rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  onClick={handleAddChannel}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Ekle
                </button>
              </div>
              <div className="space-y-2">
                {settings.channels.map(channel => (
                  <div key={channel} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>{channel}</span>
                    <button
                      onClick={() => removeChannel(channel)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Türler */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Türler</h2>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  placeholder="Yeni tür"
                  className="flex-1 rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  onClick={handleAddType}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Ekle
                </button>
              </div>
              <div className="space-y-2">
                {settings.types.map(type => (
                  <div key={type} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>{type}</span>
                    <button
                      onClick={() => removeType(type)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 