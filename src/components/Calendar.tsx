import { useState } from 'react'
import { useTaskContext } from '../context/TaskContext'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { USERS } from '../types/user'
import { 
  format, 
  eachDayOfInterval, 
  startOfMonth, 
  endOfMonth, 
  getDay, 
  subMonths, 
  addMonths, 
  isEqual,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  isSameMonth
} from 'date-fns'
import { tr } from 'date-fns/locale'

interface Filters {
  users: string[]
  codes: string[]
  channels: string[]
  types: string[]
  status: string[]
}

type ViewMode = 'month' | 'week'

// Resmi tatiller
const holidays = [
  { date: '2024-01-01', name: 'Yılbaşı', emoji: '🎉' },
  { date: '2024-04-23', name: '23 Nisan Ulusal Egemenlik ve Çocuk Bayramı', emoji: '👶' },
  { date: '2024-05-01', name: 'Emek ve Dayanışma Günü', emoji: '👷' },
  { date: '2024-05-19', name: '19 Mayıs Atatürk\'ü Anma Gençlik ve Spor Bayramı', emoji: '🏃' },
  { date: '2024-07-15', name: '15 Temmuz Demokrasi ve Milli Birlik Günü', emoji: '🇹🇷' },
  { date: '2024-08-30', name: '30 Ağustos Zafer Bayramı', emoji: '🎖️' },
  { date: '2024-10-29', name: '29 Ekim Cumhuriyet Bayramı', emoji: '🎆' },
  // Dini bayramlar için yaklaşık tarihler (her yıl değişir)
  { date: '2024-04-10', name: 'Ramazan Bayramı (1. Gün)', emoji: '🌙' },
  { date: '2024-04-11', name: 'Ramazan Bayramı (2. Gün)', emoji: '🌙' },
  { date: '2024-04-12', name: 'Ramazan Bayramı (3. Gün)', emoji: '🌙' },
  { date: '2024-06-17', name: 'Kurban Bayramı (1. Gün)', emoji: '🐑' },
  { date: '2024-06-18', name: 'Kurban Bayramı (2. Gün)', emoji: '🐑' },
  { date: '2024-06-19', name: 'Kurban Bayramı (3. Gün)', emoji: '🐑' },
  { date: '2024-06-20', name: 'Kurban Bayramı (4. Gün)', emoji: '🐑' }
]

function Calendar() {
  const { tasks } = useTaskContext()
  const { settings } = useSettings()
  const { currentUser } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [filters, setFilters] = useState<Filters>({
    users: [],
    codes: [],
    channels: [],
    types: [],
    status: []
  })
  const [showUserFilter, setShowUserFilter] = useState(false)
  const [showCodeFilter, setShowCodeFilter] = useState(false)
  const [showChannelFilter, setShowChannelFilter] = useState(false)
  const [showTypeFilter, setShowTypeFilter] = useState(false)

  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.date)
      const dateMatch = (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      )

      const userMatch = filters.users.length === 0 || 
        task.participants.some(p => filters.users.includes(p))

      const codeMatch = filters.codes.length === 0 ||
        filters.codes.includes(task.code)

      const channelMatch = filters.channels.length === 0 ||
        filters.channels.includes(task.channel)

      const typeMatch = filters.types.length === 0 ||
        filters.types.includes(task.type)

      const statusMatch = filters.status.length === 0 ||
        filters.status.includes(task.status)

      return dateMatch && userMatch && codeMatch && channelMatch && typeMatch && statusMatch
    })
  }

  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    setFilters(prev => {
      const currentValues = prev[filterType]
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      return { ...prev, [filterType]: newValues }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Tamamlandı':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Devam Ediyor':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Beklemede':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const isHoliday = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return holidays.find(h => h.date === dateStr)
  }

  const getDays = () => {
    if (viewMode === 'month') {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      return eachDayOfInterval({ start, end })
    } else {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      const end = endOfWeek(currentDate, { weekStartsOn: 1 })
      return eachDayOfInterval({ start, end })
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
    } else {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1))
    }
  }

  const days = getDays()
  const startingDayIndex = viewMode === 'month' ? getDay(startOfMonth(currentDate)) : 0

  return (
    <div className="p-4 space-y-6">
      {/* Görünüm Kontrolleri */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 rounded hover:bg-gray-100"
          >
            &#8592;
          </button>
          <h2 className="text-xl font-semibold">
            {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : "'Hafta' w, yyyy", { locale: tr })}
          </h2>
          <button
            onClick={() => navigateDate('next')}
            className="p-2 rounded hover:bg-gray-100"
          >
            &#8594;
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded ${
              viewMode === 'month' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Aylık
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded ${
              viewMode === 'week' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Haftalık
          </button>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap items-center gap-2">
          {/* Hızlı Filtreler */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilters({ users: [], codes: [], channels: [], types: [], status: [] })}
              className="px-3 py-1.5 text-sm rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Tümü
            </button>
            {currentUser && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, users: [currentUser.username] }))}
                className={`px-3 py-1.5 text-sm rounded-full ${
                  filters.users.includes(currentUser.username)
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Sadece Benim
              </button>
            )}
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: ['Devam Ediyor'] }))}
              className={`px-3 py-1.5 text-sm rounded-full ${
                filters.status.includes('Devam Ediyor')
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Devam Eden
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: ['Beklemede'] }))}
              className={`px-3 py-1.5 text-sm rounded-full ${
                filters.status.includes('Beklemede')
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Bekleyen
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: ['Tamamlandı'] }))}
              className={`px-3 py-1.5 text-sm rounded-full ${
                filters.status.includes('Tamamlandı')
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Tamamlanan
            </button>
          </div>

          {/* Detaylı Filtreler */}
          <div className="flex-1 flex flex-wrap items-center gap-2">
            {/* Kullanıcı Seçici */}
            <div className="relative">
              <button
                onClick={() => setShowUserFilter(prev => !prev)}
                className={`px-3 py-1.5 text-sm rounded-full flex items-center gap-1 ${
                  filters.users.length > 0
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span>Kişiler</span>
                {filters.users.length > 0 && (
                  <span className="bg-indigo-200 text-indigo-800 px-1.5 rounded-full text-xs">
                    {filters.users.length}
                  </span>
                )}
              </button>
              {showUserFilter && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border p-2 z-20">
                  <div className="max-h-48 overflow-y-auto">
                    {USERS.map(user => (
                      <label key={user.username} className="flex items-center p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={filters.users.includes(user.username)}
                          onChange={() => handleFilterChange('users', user.username)}
                          className="rounded text-indigo-600"
                        />
                        <span className="ml-2 text-sm">{user.displayName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Kod Seçici */}
            <div className="relative">
              <button
                onClick={() => setShowCodeFilter(prev => !prev)}
                className={`px-3 py-1.5 text-sm rounded-full flex items-center gap-1 ${
                  filters.codes.length > 0
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span>Kodlar</span>
                {filters.codes.length > 0 && (
                  <span className="bg-indigo-200 text-indigo-800 px-1.5 rounded-full text-xs">
                    {filters.codes.length}
                  </span>
                )}
              </button>
              {showCodeFilter && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border p-2 z-20">
                  <div className="max-h-48 overflow-y-auto">
                    {settings.codes.map(code => (
                      <label key={code} className="flex items-center p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={filters.codes.includes(code)}
                          onChange={() => handleFilterChange('codes', code)}
                          className="rounded text-indigo-600"
                        />
                        <span className="ml-2 text-sm">{code}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Kanal Seçici */}
            <div className="relative">
              <button
                onClick={() => setShowChannelFilter(prev => !prev)}
                className={`px-3 py-1.5 text-sm rounded-full flex items-center gap-1 ${
                  filters.channels.length > 0
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span>Kanallar</span>
                {filters.channels.length > 0 && (
                  <span className="bg-indigo-200 text-indigo-800 px-1.5 rounded-full text-xs">
                    {filters.channels.length}
                  </span>
                )}
              </button>
              {showChannelFilter && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border p-2 z-20">
                  <div className="max-h-48 overflow-y-auto">
                    {settings.channels.map(channel => (
                      <label key={channel} className="flex items-center p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={filters.channels.includes(channel)}
                          onChange={() => handleFilterChange('channels', channel)}
                          className="rounded text-indigo-600"
                        />
                        <span className="ml-2 text-sm">{channel}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tür Seçici */}
            <div className="relative">
              <button
                onClick={() => setShowTypeFilter(prev => !prev)}
                className={`px-3 py-1.5 text-sm rounded-full flex items-center gap-1 ${
                  filters.types.length > 0
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span>Türler</span>
                {filters.types.length > 0 && (
                  <span className="bg-indigo-200 text-indigo-800 px-1.5 rounded-full text-xs">
                    {filters.types.length}
                  </span>
                )}
              </button>
              {showTypeFilter && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border p-2 z-20">
                  <div className="max-h-48 overflow-y-auto">
                    {settings.types.map(type => (
                      <label key={type} className="flex items-center p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={filters.types.includes(type)}
                          onChange={() => handleFilterChange('types', type)}
                          className="rounded text-indigo-600"
                        />
                        <span className="ml-2 text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Aktif Filtreler */}
            {(filters.users.length > 0 || filters.codes.length > 0 || filters.channels.length > 0 || 
              filters.types.length > 0 || filters.status.length > 0) && (
              <button
                onClick={() => setFilters({ users: [], codes: [], channels: [], types: [], status: [] })}
                className="px-3 py-1.5 text-sm rounded-full bg-red-100 text-red-700 hover:bg-red-200"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Takvim */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-7 border-b">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
            <div
              key={day}
              className="text-center font-semibold p-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 divide-x divide-y">
          {viewMode === 'month' && Array.from({ length: startingDayIndex }).map((_, index) => (
            <div key={`empty-${index}`} className="p-2 h-32 bg-gray-50" />
          ))}

          {days.map((day) => {
            const tasksForDay = getTasksForDay(day)
            const isToday = isEqual(day, new Date())
            const isCurrentMonth = viewMode === 'week' || isSameMonth(day, currentDate)
            const holiday = isHoliday(day)

            return (
              <div
                key={day.toString()}
                className={`h-32 p-2 ${
                  isToday ? 'bg-blue-50' : 
                  holiday ? 'bg-red-50' :
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className={`flex justify-between items-center mb-1 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  <span className="font-medium text-sm">
                    {format(day, 'd')}
                  </span>
                  {holiday && (
                    <div 
                      className="text-xs text-red-600 flex items-center gap-1" 
                      title={holiday.name}
                    >
                      <span className="text-base">{holiday.emoji}</span>
                      <span className="hidden sm:inline text-[10px] font-medium truncate max-w-[100px]">
                        {holiday.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Görevler */}
                <div className="flex flex-wrap gap-1">
                  {tasksForDay.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="group relative"
                    >
                      <div 
                        className={`h-5 px-2 rounded-full flex items-center gap-1 cursor-pointer ${getStatusColor(task.status)}`}
                        title={task.code}
                      >
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        <span className="text-[10px] font-medium whitespace-nowrap">
                          {task.startTime.slice(0, 5)} {task.code}
                        </span>
                      </div>
                      
                      {/* Tooltip */}
                      <div className="hidden group-hover:block absolute left-0 top-full mt-1 z-30 w-64 p-2 bg-white rounded-lg shadow-xl border text-xs">
                        <div className="font-medium">{task.code} - {task.action}</div>
                        <div className="mt-1 space-y-1 text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-1.5 rounded bg-gray-100">
                              {task.startTime}-{task.endTime}
                            </span>
                            <span className={`text-[10px] px-1.5 rounded ${
                              task.status === 'Tamamlandı' ? 'bg-green-100 text-green-800' :
                              task.status === 'Devam Ediyor' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Katılımcılar:</span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {task.participants.map(p => {
                                const user = USERS.find(u => u.username === p)
                                return user ? (
                                  <span 
                                    key={p}
                                    className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-50 text-indigo-700"
                                  >
                                    {user.displayName.split(' ')[0]}
                                  </span>
                                ) : null
                              })}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 rounded bg-gray-100 text-[10px]">{task.channel}</span>
                            <span className="px-1.5 rounded bg-gray-100 text-[10px]">{task.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {tasksForDay.length > 3 && (
                    <div 
                      className="h-5 px-2 rounded-full bg-gray-100 text-gray-700 flex items-center cursor-pointer text-[10px]"
                      title={`${tasksForDay.length - 3} görev daha`}
                    >
                      +{tasksForDay.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Calendar 