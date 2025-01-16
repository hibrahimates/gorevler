import { useState } from 'react'
import { useTaskContext } from '../context/TaskContext'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { USERS } from '../types/user'
import { format } from 'date-fns'

export default function TaskList() {
  const { tasks, addTask, requestAudit } = useTaskContext()
  const { currentUser, isAdmin } = useAuth()
  const { settings } = useSettings()
  const [newTask, setNewTask] = useState({
    date: '',
    startTime: '',
    endTime: '',
    code: '',
    action: '',
    participants: [] as string[],
    channel: '',
    type: '',
    status: 'Beklemede',
    auditRequest: false
  })
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const handleAddTask = () => {
    if (!newTask.date || !newTask.code || !newTask.action || !newTask.channel || !newTask.type || newTask.participants.length === 0) {
      setError('Lütfen tüm gerekli alanları doldurun.')
      return
    }

    addTask(newTask)
    setNewTask({
      date: '',
      startTime: '',
      endTime: '',
      code: '',
      action: '',
      participants: [],
      channel: '',
      type: '',
      status: 'Beklemede',
      auditRequest: false
    })
    setShowForm(false)
    setError('')
  }

  const handleParticipantChange = (username: string) => {
    setNewTask(prev => {
      const participants = prev.participants.includes(username)
        ? prev.participants.filter(p => p !== username)
        : [...prev.participants, username]
      return { ...prev, participants }
    })
  }

  const handleRequestAudit = (taskId: string) => {
    if (currentUser) {
      requestAudit(taskId, currentUser.username)
    }
  }

  const userTasks = currentUser
    ? tasks.filter(task => task.participants.includes(currentUser.username))
    : []

  return (
    <div className="p-4 space-y-6">
      {/* Görev Ekleme Butonu */}
      {isAdmin() && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {showForm ? 'İptal' : 'Yeni Görev Ekle'}
          </button>
        </div>
      )}

      {/* Görev Ekleme Formu */}
      {showForm && isAdmin() && (
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-lg font-semibold">Yeni Görev</h2>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tarih
              </label>
              <input
                type="date"
                value={newTask.date}
                onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Başlangıç Saati
              </label>
              <input
                type="time"
                value={newTask.startTime}
                onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bitiş Saati
              </label>
              <input
                type="time"
                value={newTask.endTime}
                onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kod
              </label>
              <select
                value={newTask.code}
                onChange={(e) => setNewTask({ ...newTask, code: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Seçiniz</option>
                {settings.codes.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kanal
              </label>
              <select
                value={newTask.channel}
                onChange={(e) => setNewTask({ ...newTask, channel: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Seçiniz</option>
                {settings.channels.map(channel => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tür
              </label>
              <select
                value={newTask.type}
                onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Seçiniz</option>
                {settings.types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <input
                type="text"
                value={newTask.action}
                onChange={(e) => setNewTask({ ...newTask, action: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Görev açıklaması"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Katılımcılar
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-2 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                {USERS.map(user => (
                  <label key={user.username} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newTask.participants.includes(user.username)}
                      onChange={() => handleParticipantChange(user.username)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">{user.displayName}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAddTask}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Ekle
            </button>
          </div>
        </div>
      )}

      {/* Görev Listesi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y">
          {userTasks.map(task => (
            <div key={task.id} className="p-4 hover:bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">
                      {format(new Date(task.date), 'dd.MM.yyyy')}
                    </span>
                    {task.startTime && task.endTime && (
                      <span className="text-sm text-gray-500">
                        {task.startTime}-{task.endTime}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium">{task.code} - {task.action}</h3>
                  <div className="text-sm text-gray-500">
                    <span>Kanal: {task.channel}</span>
                    <span className="mx-2">•</span>
                    <span>Tür: {task.type}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Katılımcılar: {task.participants.join(', ')}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    task.status === 'Tamamlandı'
                      ? 'bg-green-100 text-green-800'
                      : task.status === 'Devam Ediyor'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status}
                  </span>
                  {!task.auditRequest && task.status !== 'Tamamlandı' && (
                    <button
                      onClick={() => handleRequestAudit(task.id)}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Denetim Talep Et
                    </button>
                  )}
                  {task.auditRequest && !task.auditApprovedBy && (
                    <span className="text-sm text-orange-600">
                      Denetim Bekleniyor
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {userTasks.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              Görev bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 