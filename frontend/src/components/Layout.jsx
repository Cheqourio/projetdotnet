import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'

const Layout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    navigate('/login')
  }

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    in: {
      opacity: 1,
      y: 0,
    },
    out: {
      opacity: 0,
      y: -20,
    },
  }

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4,
  }

  return (
    <div className="app-shell">
      <Sidebar onLogout={handleLogout} />
      <div className="main-content">
        <Navbar schoolName="Académie digitale" onLogout={handleLogout} />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }} // Ensure it takes space correctly
          >
            {children}
          </motion.div>
        </AnimatePresence>
        <Footer />
      </div>
    </div>
  )
}

export default Layout

