import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FaVideo } from 'react-icons/fa'
import { setAuthToken } from '../api/client'
import { useAuth } from '../state/AuthContext.jsx'

export default function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, user, signOut } = useAuth()

  const onSignOut = () => {
    signOut()
    setAuthToken(null)
    navigate('/')
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="container" style={{ padding: '12px 16px', display: 'flex', gap: 16, alignItems: 'center' }}>
        <Link
          to="/"
          style={{
            fontWeight: 800,
            textDecoration: 'none',
            color: 'white',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <FaVideo aria-hidden="true" style={{ fontSize: 14, opacity: 0.95 }} />
          <span>Video Platform</span>
        </Link>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 14, alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              <NavLink to="/upload" style={{ color: 'white', textDecoration: 'none', opacity: 0.9 }}>
                Upload
              </NavLink>
              <button type="button" onClick={onSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/signin" style={{ color: 'white', textDecoration: 'none', opacity: 0.9 }}>
                Sign in
              </NavLink>
              <NavLink to="/signup" style={{ color: 'white', textDecoration: 'none', opacity: 0.9 }}>
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
