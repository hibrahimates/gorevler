import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { USERS } from '../types/user'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [selectedUser, setSelectedUser] = useState('')
  const { login, currentUser } = useAuth()
  const navigate = useNavigate()

  const handleLogin = () => {
    if (selectedUser) {
      const success = login(selectedUser)
      if (success) {
        navigate('/')
      }
    }
  }

  // Eğer kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
  if (currentUser) {
    navigate('/')
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Proje Takip Sistemi
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Lütfen kullanıcı seçin
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="user" className="sr-only">
                Kullanıcı
              </label>
              <select
                id="user"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="">Kullanıcı seçin</option>
                {USERS.map(user => (
                  <option key={user.id} value={user.username}>
                    {user.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <button
              onClick={handleLogin}
              disabled={!selectedUser}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Giriş Yap
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 