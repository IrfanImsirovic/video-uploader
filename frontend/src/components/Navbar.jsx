import { Link, NavLink, useNavigate } from 'react-router-dom'
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
    <header style={{ borderBottom: '1px solid #e5e5e5' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '12px 16px', display: 'flex', gap: 16 }}>
        <Link to="/" style={{ fontWeight: 700, textDecoration: 'none', color: 'inherit' }}>
          VideoUploader
        </Link>

        <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <NavLink to="/">Home</NavLink>
          {isAuthenticated && <NavLink to="/upload">Upload</NavLink>}
        </nav>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              <span style={{ opacity: 0.8 }}>{user?.username ?? 'Signed in'}</span>
              <button type="button" onClick={onSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/signin">Sign in</NavLink>
              <NavLink to="/signup">Sign up</NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
