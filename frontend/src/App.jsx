import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

import Navbar from './components/Navbar.jsx'
import RequireAuth from './components/RequireAuth.jsx'

import HomePage from './pages/HomePage.jsx'
import SignInPage from './pages/SignInPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import UploadPage from './pages/UploadPage.jsx'
import VideoPage from './pages/VideoPage.jsx'

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/videos/:id" element={<VideoPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/upload"
            element={
              <RequireAuth>
                <UploadPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
