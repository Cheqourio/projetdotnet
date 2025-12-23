import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import logoImage from '../pictures/Logo.png'

const Navbar = ({ schoolName, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      localStorage.removeItem('auth_token')
      navigate('/login')
    }
    setShowMenu(false)
  }

  const handleAccountSettings = () => {
    navigate('/settings')
    setShowMenu(false)
  }

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <h1>{schoolName}</h1>
        <span>Tableau de bord</span>
      </div>

      <div className="navbar-right">
        <div className="user-menu" ref={menuRef} onClick={() => setShowMenu(!showMenu)}>
          <div className="user-info">
            <span className="user-name">Admin</span>
            <span className="user-role">Administrateur</span>
          </div>
          <img src={logoImage} alt="User" className="user-avatar" />

          {showMenu && (
            <div className="navbar-dropdown">
              <div className="dropdown-header">
                <p className="dropdown-user-name">Admin User</p>
                <p className="dropdown-user-email">admin@school.com</p>
              </div>
              <div className="dropdown-divider"></div>
              <button
                type="button"
                className="navbar-dropdown-item"
                onClick={(e) => { e.stopPropagation(); handleAccountSettings(); }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Paramètres
              </button>
              <button
                type="button"
                className="navbar-dropdown-item danger"
                onClick={(e) => { e.stopPropagation(); handleLogout(); }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
