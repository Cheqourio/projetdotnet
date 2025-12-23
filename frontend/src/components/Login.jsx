import { useState } from 'react'

const Login = ({ onSubmit, error }) => {
  const [email, setEmail] = useState('admin@school.com')
  const [password, setPassword] = useState('Admin123!')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    await onSubmit({ email, password })
    setIsLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', boxShadow: '0 10px 25px -5px rgba(67, 97, 238, 0.5)' }}>
            🎓
          </div>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--gray-900)' }}>Bienvenue</h1>
            <p style={{ margin: 0, color: 'var(--gray-500)' }}>Connectez-vous à votre espace administrateur</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email institutionnel</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@school.com"
              required
              style={{ padding: '0.75rem 1rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ padding: '0.75rem 1rem' }}
            />
          </div>

          {error && (
            <div style={{ padding: '1rem', borderRadius: '0.5rem', background: 'rgba(239, 35, 60, 0.1)', color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center', border: '1px solid rgba(239, 35, 60, 0.2)' }}>
              {error}
            </div>
          )}

          <button type="submit" className="button primary" disabled={isLoading} style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', marginTop: '0.5rem' }}>
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--gray-100)', fontSize: '0.85rem', color: 'var(--gray-500)' }}>
          <p style={{ marginBottom: '0.5rem' }}>Identifiants de démonstration :</p>
          <code style={{ background: 'var(--gray-100)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', color: 'var(--gray-800)' }}>admin@school.com</code>
        </div>
      </div>
    </div>
  )
}

export default Login
