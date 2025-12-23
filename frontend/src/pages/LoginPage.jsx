import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Login from '../components/Login'
import { login as loginApi } from '../services/api'

const LoginPage = () => {
  const [authError, setAuthError] = useState('')
  const navigate = useNavigate()
  const token = localStorage.getItem('auth_token')

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  const handleLogin = async ({ email, password }) => {
    try {
      const result = await loginApi({ email, password })
      localStorage.setItem('auth_token', result.token)
      setAuthError('')
      navigate('/dashboard')
    } catch (error) {
      setAuthError('Identifiants incorrects. Merci de réessayer.')
    }
  }

  return <Login onSubmit={handleLogin} error={authError} />
}

export default LoginPage

