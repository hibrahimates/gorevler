import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import TaskList from './components/TaskList'
import Calendar from './components/Calendar'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'
import { TaskProvider } from './context/TaskContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { NotificationProvider } from './context/NotificationContext'
import { initializeFirebase } from './utils/initializeFirebase'

function RequireAuth({ children }: { children: JSX.Element }) {
  const { currentUser } = useAuth()
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

function Layout() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { currentUser, logout, isAdmin } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">Proje Takip Sistemi</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={`${
                    activeTab === 'dashboard'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  Dashboard
                </Link>
                <Link
                  to="/tasks"
                  className={`${
                    activeTab === 'tasks'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  onClick={() => setActiveTab('tasks')}
                >
                  Görevler
                </Link>
                <Link
                  to="/calendar"
                  className={`${
                    activeTab === 'calendar'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  onClick={() => setActiveTab('calendar')}
                >
                  Takvim
                </Link>
                <Link
                  to="/settings"
                  className={`${
                    activeTab === 'settings'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  onClick={() => setActiveTab('settings')}
                >
                  Ayarlar
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              {currentUser && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    {currentUser.displayName}
                    {isAdmin() && <span className="ml-1 text-xs text-indigo-600">(Admin)</span>}
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  useEffect(() => {
    initializeFirebase().catch(console.error)
  }, [])

  return (
    <AuthProvider>
      <SettingsProvider>
        <TaskProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/*"
                  element={
                    <RequireAuth>
                      <Layout />
                    </RequireAuth>
                  }
                />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </TaskProvider>
      </SettingsProvider>
    </AuthProvider>
  )
}

export default App
