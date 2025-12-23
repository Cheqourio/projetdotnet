import { NavLink } from 'react-router-dom'

const menuItems = [
  { id: 'dashboard', path: '/dashboard', label: 'Tableau de bord' },
  { id: 'students', path: '/student', label: 'Étudiants' },
  { id: 'teachers', path: '/teachers', label: 'Enseignants' },
  { id: 'courses', path: '/courses', label: 'Cours' },
  { id: 'grades', path: '/grades', label: 'Notes' },
  { id: 'settings', path: '/settings', label: 'Paramètres' },
]

const Sidebar = ({ onLogout }) => {

  return (
    <aside className="sidebar" aria-label="Navigation principale">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span>🎓</span>
          <span>School Manager</span>
        </div>
      </div>

      <div className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? 'sidebar-menu-item active' : 'sidebar-menu-item'
                }
              >
                {/* You can add icons here if needed */}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-footer">
        <button type="button" className="sidebar-logout" onClick={() => onLogout?.()}>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar

