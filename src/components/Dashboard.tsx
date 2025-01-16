import { useState } from 'react'
import { useTaskContext } from '../context/TaskContext'
import { useAuth } from '../context/AuthContext'
import { format, addDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { tr } from 'date-fns/locale'

export default function Dashboard() {
  const { tasks, approveAudit, cancelAuditApproval, reopenTask } = useTaskContext()
  const { currentUser, isAdmin } = useAuth()
  const [showCompleted, setShowCompleted] = useState(false)
  const [dateRange, setDateRange] = useState(7) // Varsayılan 7 gün
  const [showOnlyToday, setShowOnlyToday] = useState(false)

  const getUpcomingTasks = () => {
    const today = startOfDay(new Date())
    const endDate = showOnlyToday ? endOfDay(today) : endOfDay(addDays(today, dateRange))

    return tasks.filter(task => {
      const taskDate = new Date(task.date)
      return isWithinInterval(taskDate, { start: today, end: endDate }) &&
        (currentUser ? task.participants.includes(currentUser.username) : false)
    })
  }

  const pendingAudits = tasks.filter(task => 
    task.auditRequest && !task.auditApprovedBy
  )

  const completedTasks = tasks.filter(task => 
    task.status === 'Tamamlandı'
  )

  const handleApproveAudit = (taskId: string) => {
    if (currentUser) {
      approveAudit(taskId, currentUser.username)
    }
  }

  const handleCancelApproval = (taskId: string) => {
    cancelAuditApproval(taskId)
  }

  const handleReopenTask = (taskId: string) => {
    reopenTask(taskId)
  }

  return (
    <div className="p-4 space-y-6">
      {/* Yaklaşan Görevler */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Yaklaşan Görevler</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showOnlyToday}
                onChange={(e) => {
                  setShowOnlyToday(e.target.checked)
                  if (e.target.checked) {
                    setDateRange(0)
                  }
                }}
                className="rounded text-indigo-600"
              />
              <span className="text-sm">Sadece Bugün</span>
            </div>
            {!showOnlyToday && (
              <select
                value={dateRange}
                onChange={(e) => setDateRange(Number(e.target.value))}
                className="rounded-md border-gray-300 text-sm"
              >
                <option value="7">7 Gün</option>
                <option value="14">14 Gün</option>
                <option value="30">30 Gün</option>
              </select>
            )}
          </div>
        </div>
        <div className="divide-y">
          {getUpcomingTasks().map(task => (
            <div key={task.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">
                      {format(new Date(task.date), 'dd MMMM yyyy', { locale: tr })}
                    </span>
                    {task.startTime && task.endTime && (
                      <span className="text-sm text-gray-500">
                        {task.startTime}-{task.endTime}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium">{task.code} - {task.action}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    <span>Kanal: {task.channel}</span>
                    <span className="mx-2">•</span>
                    <span>Tür: {task.type}</span>
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
                </div>
              </div>
            </div>
          ))}
          {getUpcomingTasks().length === 0 && (
            <div className="p-4 text-center text-gray-500">
              {showOnlyToday ? 'Bugün için görev bulunmuyor.' : `${dateRange} gün içinde görev bulunmuyor.`}
            </div>
          )}
        </div>
      </div>

      {/* Denetim Bekleyen Görevler (Admin) */}
      {isAdmin() && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Denetim Bekleyen Görevler</h2>
          </div>
          <div className="divide-y">
            {pendingAudits.map(task => (
              <div key={task.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">
                        {format(new Date(task.date), 'dd MMMM yyyy', { locale: tr })}
                      </span>
                      {task.startTime && task.endTime && (
                        <span className="text-sm text-gray-500">
                          {task.startTime}-{task.endTime}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium">{task.code} - {task.action}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      <span>Kanal: {task.channel}</span>
                      <span className="mx-2">•</span>
                      <span>Tür: {task.type}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleApproveAudit(task.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 text-sm"
                  >
                    Onayla
                  </button>
                </div>
              </div>
            ))}
            {pendingAudits.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                Denetim bekleyen görev bulunmuyor.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tamamlanan Görevler */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Tamamlanan Görevler</h2>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            {showCompleted ? 'Gizle' : 'Göster'}
          </button>
        </div>
        {showCompleted && (
          <div className="divide-y">
            {completedTasks.map(task => (
              <div key={task.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">
                        {format(new Date(task.date), 'dd MMMM yyyy', { locale: tr })}
                      </span>
                      {task.startTime && task.endTime && (
                        <span className="text-sm text-gray-500">
                          {task.startTime}-{task.endTime}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium">{task.code} - {task.action}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      <span>Kanal: {task.channel}</span>
                      <span className="mx-2">•</span>
                      <span>Tür: {task.type}</span>
                      {task.auditApprovedBy && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Onaylayan: {task.auditApprovedBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {isAdmin() && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCancelApproval(task.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Onayı İptal Et
                      </button>
                      <button
                        onClick={() => handleReopenTask(task.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Yeniden Aç
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {completedTasks.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                Tamamlanan görev bulunmuyor.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 